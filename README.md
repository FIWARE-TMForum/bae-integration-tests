# Docker system made to test the fiware structure

## Requirements:
* Have the docker images of:
  * **Business APIs**. A ready to build image is provided in this repository; Just clone this repo and build the image with `docker build -t biz_apis .` on this dir.
  * **Business Logic-Proxy**. You should have an image of the logic-proxy
    from
    [GitHub page](https://github.com/FIWARE-TMForum/business-ecosystem-logic-proxy/tree/develop/) built
    with the tag 'logic_proxy'.
  * **Business Charging-Backend**. You should have an image of the charging backend from [Github page](https://github.com/FIWARE-TMForum/business-ecosystem-charging-backend/tree/develop) built with the tag 'charging_backend'.
  * **Business RSS**. You should have an image of the charging backend
    from
    [Github page](https://github.com/FIWARE-TMForum/business-ecosystem-rss/tree/develop) built
    with the tag 'biz_rss'.
    
## Steps

1. Comment out all docker-compose entries except biz_db and make `docker-compose
   up` or alternatively make `docker-compose run biz_db` in order to solve
   this [issue](https://github.com/docker-library/mysql/issues/81) in which MySQL
   initialization gets in the way of docker-compose initialization; As soon as
   the biz_db finish its initialization, stop it. You have now a ready-to-run
   configuration on ./mysql/ (a shared volume).
2. 

