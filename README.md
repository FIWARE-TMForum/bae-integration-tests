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
    [Github page](https://github.com/FIWARE-TMForum/business-ecosystem-rss/tree/develop) built with the tag 'biz_rss'.
# TODO
