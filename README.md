# docker-optimize

Optimize Dockerfiles, so the final docker image will have fewer layers.

Optimizations:
* Collapse multiple RUN statements into a single one.
* Collapse multiple ENV declarations into a single one.

## Install

```sh
npm install -g docker-optimize
```

## Usage

```sh
docker-optimize Dockerfile.build > Dockerfile
```

### Dockerfile.build (input)

```text
FROM ubuntu:16.04
MAINTAINER Bogdan Mustiata <bogdan.mustiata@gmail.com>

RUN apt-get update -y && apt-get upgrade -y

RUN useradd -m raptor

ENV UID=1000
ENV GID=1000

CMD perl -pi -e "s/raptor:x:1000:1000/raptor:x:$UID:$GID/" /etc/passwd && \
    perl -pi -e "s/raptor:x:1000:/raptor:x:$GID:/" /etc/group

RUN apt-get install -y\
    libav-tools \
    gimp

ADD bin/create-gif.py /usr/lib/gimp/2.0/plug-ins/create-gif.py

USER raptor

ENV INPUT_FILE=/tmp/in/test.avi
ENV OUTPUT_FILE=/tmp/out/test.gif

#
# The name of the file name that will be saved in the writing
# folder.
#
ENV WRITE_FOLDER=/tmp/write
ENV OUTPUT_FILE_NAME=test.gif
ENV SCALING_FACTOR=1

ADD bin /home/raptor/bin

CMD /home/raptor/bin/run_conversion.sh $OUTPUT_FILE_NAME $SCALING_FACTOR
```

### Dockerfile (output)

```text
# Optimized by docker-optimize: https://www.npmjs.com/package/docker-optimize
FROM ubuntu:16.04
MAINTAINER Bogdan Mustiata <bogdan.mustiata@gmail.com>
ENV { "UID":"1000","GID":"1000" }
CMD perl -pi -e "s/raptor:x:1000:1000/raptor:x:$UID:$GID/" /etc/passwd &&      perl -pi -e "s/raptor:x:1000:/raptor:x:$GID:/" /etc/group
ADD bin/create-gif.py /usr/lib/gimp/2.0/plug-ins/create-gif.py
RUN apt-get update -y && apt-get upgrade -y && useradd -m raptor && apt-get install -y     libav-tools      gimp
USER raptor
ENV { "INPUT_FILE":"/tmp/in/test.avi","OUTPUT_FILE":"/tmp/out/test.gif","WRITE_FOLDER":"/tmp/write","OUTPUT_FILE_NAME":"test.gif","SCALING_FACTOR":"1" }
ADD bin /home/raptor/bin
CMD /home/raptor/bin/run_conversion.sh $OUTPUT_FILE_NAME $SCALING_FACTOR
```

