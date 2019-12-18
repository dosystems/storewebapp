#!/bin/bash

ROSSLOC=/var/www/html/ross/client
BUILDLOC=prod

if [ "$1" = "live" ]; then
   echo "Uploading to live system.."
   #live server 1
   PEMFILE=~/Desktop/harikrishna.pem
   TARGETSERVER=ubuntu@54.186.183.28
   cp $ROSSLOC/src/app/app.config.ts.live $ROSSLOC/src/app/app.config.ts
elif [ "$1" = "-h" ]; then
   echo "Usage : clientbuild.sh [test|live]"
   exit
else
   echo "Uploading to test server.."
   # Test server
   TARGETSERVER=root@api.grandfinex.com
   cp $ROSSLOC/src/app/app.config.ts.test $ROSSLOC/src/app/app.config.ts
fi

DATE=`date +%Y-%m-%d-%H-%M`

cd $ROSSLOC

echo "Building..." 
ng build --$BUILDLOC > /tmp/adminngbuild.txt

if [ -d "$ROSSLOC/dist" ];
then
  cd $ROSSLOC/dist
  echo "Creating tar.."
  tar -czf ~/Downloads/rossclient.tar.gz *
  if [ "$1" = "live" ]; then
  echo "Copying tar to live server.."
  scp -i $PEMFILE ~/Downloads/rossclient.tar.gz $TARGETSERVER:~/
  echo "Extracting tar in live server.."
  ssh -i $PEMFILE $TARGETSERVER  "cd /var/www/buxsuperstore.com/public_html; sudo tar -czf ~/rossclient$DATE.tar.gz *;sudo rm -rf *;sudo tar -xzf ~/rossclient.tar.gz"  
  else
  echo "Copying tar to test server.."
  scp  ~/Downloads/rossclient.tar.gz $TARGETSERVER:~/
  echo "Extracting tar in test server.."
  ssh $TARGETSERVER "cd /var/www/shop.renkomarket.com/public_html; sudo tar -czf ~/rossclient$DATE.tar.gz *;sudo rm -rf *;sudo tar -xzf ~/rossclient.tar.gz"
  fi  
  echo "Successful"
else
   echo "Build failed"
fi
