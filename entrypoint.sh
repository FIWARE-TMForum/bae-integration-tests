#!/usr/bin/env bash

################################## ENVIRONMENT VARIABLES NEEDED ############################
if [[ -z $MYSQL_ROOT_PASSWORD ]];
then
    echo MYSQL_ROOT_PASSWORD is not set
    exit 1
fi

if [[ -z $MYSQL_HOST ]];
then
    echo MYSQL_HOST is not set
    exit 1
fi

############################################################################################

function create_tables { 
    echo "Creating Database tables"
    mysql -u root --password=$MYSQL_ROOT_PASSWORD -h $MYSQL_HOST -e "CREATE DATABASE IF NOT EXISTS DSPRODUCTCATALOG2;"

    mysql -u root --password=$MYSQL_ROOT_PASSWORD -h $MYSQL_HOST -e "CREATE DATABASE IF NOT EXISTS DSPRODUCTORDERING;"

    mysql -u root --password=$MYSQL_ROOT_PASSWORD -h $MYSQL_HOST -e "CREATE DATABASE IF NOT EXISTS DSPRODUCTINVENTORY;"

    mysql -u root --password=$MYSQL_ROOT_PASSWORD -h $MYSQL_HOST -e "CREATE DATABASE IF NOT EXISTS DSPARTYMANAGEMENT;"

    mysql -u root --password=$MYSQL_ROOT_PASSWORD -h $MYSQL_HOST -e "CREATE DATABASE IF NOT EXISTS DSBILLINGMANAGEMENT;"

    mysql -u root --password=$MYSQL_ROOT_PASSWORD -h $MYSQL_HOST -e "CREATE DATABASE IF NOT EXISTS DSCUSTOMER;"

    mysql -u root --password=$MYSQL_ROOT_PASSWORD -h $MYSQL_HOST -e "CREATE DATABASE IF NOT EXISTS DSUSAGEMANAGEMENT;"

    mysql -u root --password=$MYSQL_ROOT_PASSWORD -h $MYSQL_HOST -e "CREATE DATABASE IF NOT EXISTS RSS;"
}


function glassfish_related {
    echo "Deploying APIs"
    python /apis-entrypoint.py
}

############################################################################################

export PATH=$PATH:/glassfish4/glassfish/bin
asadmin start-domain

exec 8<>/dev/tcp/$MYSQL_HOST/3306
mysqlStatus=$?
doneTables=1

exec 9<>/dev/tcp/127.0.0.1/4848
glassfishStatus=$?
doneGlassfish=1

if [[ $mysqlStatus -eq 0 ]]; then
    create_tables
    doneTables=0
fi

if [[ $glassfishStatus -eq 0 && $mysqlStatus -eq 0 ]]; then
    glassfish_related
    doneGlassfish=0
fi

exec 8>&- # close output connection
exec 8<&- # close input connection

exec 9>&- # close output connection
exec 9<&- # close input connection
