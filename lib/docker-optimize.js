var fs = require("fs");
var parser = require("docker-file-parser");

// rules:
// ENV commants get clustered at the beginning.
// RUN commands get clustered at the end.
//

if (process.argv.length <= 2) {
    console.error("You need to pass in the name of the Dockerfile");
    process.exit(1);
}

var fileName = process.argv[2]; // the file to process
var options = { includeComments: false };
var content = fs.readFileSync(fileName, "utf-8");

var commands = parser.parse(content, options);

var currentSegment = {
    otherCommands: []
};

console.log("# Optimized by docker-optimize: https://www.npmjs.com/package/docker-optimize");

commands.forEach(function(command) {
    if (command.name == "RUN") {
        if (!currentSegment.runCommand) {
            currentSegment.runCommand = command.args;
            return;
        }

        currentSegment.runCommand += " && " + command.args;
        return;
    }

    if (command.name == "ENV") {
        if (!currentSegment.envCommand) {
            currentSegment.envCommand = {};
        }

        for (var k in command.args) {
            currentSegment.envCommand[k] = command.args[k];
        }
        return;
    }

    currentSegment.otherCommands.push(command);

    if (command.name == "USER") {
        flushCurrentSegment();
    }
});

flushCurrentSegment();

function flushCurrentSegment() {
    var commandArray = currentSegment.otherCommands.slice(0);
    if (currentSegment.envCommand) {
        commandArray.push({
            name: "ENV",
            args: currentSegment.envCommand
        });
    }

    if (currentSegment.runCommand) {
        commandArray.push({
            name: "RUN",
            args: currentSegment.runCommand
        });
    }

    commandArray.sort(function(cmd1, cmd2) {
        if (cmd1.name == "USER") {
            return 1;
        } else if (cmd2.name == "USER") {
            return -1;
        }

        if (cmd1.name == "FROM") {
            return -1;
        } else if (cmd2.name == "FROM") {
            return 1;
        }

        if (cmd1.name == "MAINTAINER") {
            return -1;
        } else if (cmd2.name == "MAINTAINER") {
            return 1;
        }

        if (cmd1.name == "ENV") {
            return -1;
        } else if (cmd2.name == "ENV") {
            return 1;
        }
    });

    commandArray.forEach(function(command) {
        if (command.args.join) {
            console.log(command.name + " " + command.args.join(" "));
        } else if (typeof command.args == "string") {
            console.log(command.name + " " + command.args);
        } else {
            var jsonValue = JSON.stringify(command.args);
            jsonValue = jsonValue.replace(/^\{(.*)\}$/, "{ $1 }");

            console.log(command.name + " " + jsonValue);
        }
    });

    currentSegment = { otherCommands: [] };
}

