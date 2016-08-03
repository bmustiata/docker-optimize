= docker-optimize

Optimize the RUN statements, so the final docker image will have fewer layers.

Optimize multiple `RUN` commands into one, and moves the `ENV` statements before all the `RUN` ones.

