mysql -u root -ptoor -Nse 'show tables' DSBILLINGMANAGEMENT | while read table; do mysql -u root -ptoor -e "DELETE FROM $table" DSBILLINGMANAGEMENT; done
mysql -u root -ptoor -Nse 'show tables' DSCUSTOMER | while read table; do mysql -u root -ptoor -e "DELETE FROM $table" DSCUSTOMER; done
mysql -u root -ptoor -Nse 'show tables' DSPARTYMANAGEMENT | while read table; do mysql -u root -ptoor -e "DELETE FROM $table" DSPARTYMANAGEMENT; done
mysql -u root -ptoor -Nse 'show tables' DSPRODUCTCATALOG2 | while read table; do mysql -u root -ptoor -e "DELETE FROM $table" DSPRODUCTCATALOG2; done
mysql -u root -ptoor -Nse 'show tables' DSPRODUCTINVENTORY | while read table; do mysql -u root -ptoor -e "DELETE FROM $table" DSPRODUCTINVENTORY; done
mysql -u root -ptoor -Nse 'show tables' DSPRODUCTORDERING | while read table; do mysql -u root -ptoor -e "DELETE FROM $table" DSPRODUCTORDERING; done
mysql -u root -ptoor -Nse 'show tables' DSUSAGEMANAGEMENT | while read table; do mysql -u root -ptoor -e "DELETE FROM $table" DSUSAGEMANAGEMENT; done
mysql -u root -ptoor -Nse 'show tables' RSS | while read table; do mysql -u root -ptoor -e "DELETE FROM $table" RSS; done
