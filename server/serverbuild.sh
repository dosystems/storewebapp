#!/bin/bash

APPLOC=/var/www/html/ross/server

if [ "$1" = "test" ]; then
   echo "Uploading to test system.."
   #test server
   #PEMFILE=abc.pem
   TARGETSERVER=root@shopapi.renkomarket.com
elif [ "$1" = "live" ]; then
   echo "Uploading to live system.."
   #live server
   PEMFILE=~/Desktop/harikrishna.pem
   TARGETSERVER=ubuntu@54.186.183.28
elif [ "$1" = "-h" ]; then
   echo "Usage : serverbuild.sh [test|live]"
   exit
else
   echo "Invalid argument"
   exit 1
fi

DATE=`date +%Y-%m-%d-%H-%M`

cd $APPLOC
 
tar -czf ~/Downloads/rossserver.tar.gz server --exclude node_modules --exclude server/upload
if [ "$1" = "test" ]; then
scp ~/Downloads/rossserver.tar.gz $TARGETSERVER:~/
   ssh $TARGETSERVER "cd /var/www/shopapi.renkomarket.com/server; sudo tar -czf ~/rossServer$DATE.tar.gz server --exclude node_modules --exclude server/upload; sudo tar -xzf ~/rossserver.tar.gz; "
elif [ "$1" = "live" ]; then
scp -i $PEMFILE ~/Downloads/rossserver.tar.gz $TARGETSERVER:~/
    ssh -i $PEMFILE $TARGETSERVER "cd /var/www/buxsuperstoreapi.com/server; sudo tar -czf ~/rossServer$DATE.tar.gz server --exclude node_modules --exclude server/upload; sudo tar -xzf ~/rossserver.tar.gz; "
fi
echo "Successfully uploaded server"

