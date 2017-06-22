# Docker system made to test the fiware structure

## Requirements:
* Have the docker images of:
  * **Business APIs**. A ready to build image is provided in this repository; Just clone this repo and build the image with `docker build -t biz_apis .` on this dir.
  * **Business Logic-Proxy**. You should have an image of the logic-proxy
    from
    [GitHub page](https://github.com/FIWARE-TMForum/business-ecosystem-logic-proxy/tree/develop/) built
    with the tag 'logic_proxy'. Or you should be able to easily build one from
    that repo by doing `docker build -t logic_proxy .` at /docker/ dir.
  * **Business Charging-Backend**. You should have an image of the charging
    backend
    from
    [Github page](https://github.com/FIWARE-TMForum/business-ecosystem-charging-backend/tree/develop) built
    with the tag 'charging_backend'. Or you should be able to easily build one from
    that repo by doing `docker build -t charging_backend .` at /docker/ dir.
  * **Business RSS**. You should have an image of the charging backend
    from
    [Github page](https://github.com/FIWARE-TMForum/business-ecosystem-rss/tree/develop) built
    with the tag 'biz_rss'.
  * **Webdriverio**. In this repository one webdriverio ready-to-build is
    provided inside *webdriverio* dir: Simply execute `docker build -t
    webdriverio .` on that dir.

- In case you want a different version of any of the containers -You may be
  developing some feature and want to test that feature- you should change the container dockerfile to pull the repository you need and build your own images.
## Steps

1. Comment out all docker-compose entries except biz_db and make `docker-compose
   up` or alternatively make `docker-compose run biz_db` in order to solve
   this [issue](https://github.com/docker-library/mysql/issues/81) in which MySQL
   initialization gets in the way of docker-compose initialization; As soon as
   the biz_db finish its initialization, stop it. You have now a ready-to-run
   configuration on ./mysql/ (a shared volume).
   1. Alternatively, it might be possible to use the .sql dumps. This should
      create and initialice the database. However, glassfish deployment is still
      needed so Im testing this possibility
2. Fill up the following fields:
   1. At charging_backend container. *ADMIN_EMAIL=<yourEmail@here.com>*
   2. At webdriverio container, under volumes. Uncomment the label and fill up
      the *<PATH/TO/YOUR/WEBDRIVERIO/DIR>* . *This is* **VERY** *important*
3. Uncomment everything that was previously uncommented. If everything is
   properly set, then execute `docker-compose run --rm webdriverio bash -c "sleep 60 && wdio"` and all
   should be run smoothly. Give it a few minutes to initialice everything,
   deploy wars, etc. 
4.  **Important!** The tests might fail because the system is not completely
      functional yet.
   1. To check if everything went fine, do `docker ps -a`. This will show you
      the currently running containers. Find the logic_proxy one, copy the
      *CONTAINER ID* hash and execute `docker logs <containerID>` to see the log
      output of that container.
      1. You may use the options `--since 1s` to show only the log from 1s ago
         until now.
      2. Aditionaly, you may also use `-f` to keep the log open and running in
         that console.
    2. The last output of the logic_proxy container should be *<TIMESTAMP>  -
       INFO: Server - Business Ecosystem Logic Proxy starting on port 8000*
5. A VNC server is provided so admins may see what the tests are doing. In order
   to connect to that server you may use whatever your favourite VNC client is.
   1. I am using vinagre, for simplicity. But as i said, any other VNC client
      may be used.
   2. To connect from the host machine, connect to **localhost:5900** if in
      firefox, **localhost:5901** in chrome, and as soon as one of the browsers
      starts you should be able to see the progress.
   3. There are a lot of different configurations, in case of doubt or specific
      vnc configuration - More vnc simultaneous connections, etc - see
      [docker-Selenium github Page](https://github.com/SeleniumHQ/docker-selenium)
6. With each test, properly ended or not, a snapshot is taken of the current
   frontend state. Those shots are saved on the dir *shots* inside webdriverio's
   dir.
   1. It is possible to configure those shots to test how the web should look
      and warn the user if anything of the interface changes between test
      executions
   2. Currently, that kind of CSS testing is not provided by this repo but, even
      if i cant promise to implement it, im seriously considering it.
   3. More information of this feature can be checked
      at [webdrivercss](http://webdriver.io/guide/plugins/webdrivercss.html)
      
Anyway, all the information about the capabilities and possible configurations
is avaliable at [webdriverio](http://webdriver.io/) and, of
course, [Google](www.google.com) or [DuckDuckGo](https://duckduckgo.com/)

## Common problems

As you can imagine, this has been a nightmare to build and configure. My main
motivation was to create an autonomous docker system that allows developers to
test whatever app they want to.

First of all, the entire docker-compose is built ad-hoc so there may be a lot of
inexplicable config errors so you should **really** check that the *config.js*
file of logic-proxy container and *settings.py* file of charging\_backend
container are properly filled.

Remember that you should have replaced all important fields of the
docker-compose with the appropiate info. 

The most common problem i had was the version control among the
containers: In each of the Dockerfiles there is a *git pull* which chooses the
aplication version to use. If you dont know which version goes with each one,
ask your manager or pray -Both will be useless- but as long as nothing changes,
the provided code should work.
- You should always pull -update- this repo **before** executing anything. This repo
  will be updated with newer versions - Thats what i hope-
  
In case of running manually the command `docker-compose run --rm webdriverio
wdio` to run the tests remember that if you kill the docker process, it will leave
behind an stopped container of webdriverio. Keep an eye on those
zombie-containers as they may bleed your RAM badly.

Remember that the images are static, meaning that hot-changes inside the
containers are not permanent; If you want any changes to be permanent, modify
the Dockerfile and build again the image.

This instalation expects the ports that will be used to be free, meaning that if
any of them is occupied by another expernal service, you will have a very bad
time of crashes, 500 code responses and what-not.

Finally, i have set up a service listening for tcp connections at 54645 port. In
case you need to clean the logic\_proxy indexes between tests -And Im sure you
will- so simply open a tcp connection -Its not needed to send any specific
message- and the logic\_proxy container should clean the indexes for you. **This
is being tested so expect some changes and errors**
