#!/bin/bash

ROSSLOC=/var/www/html/ross/vendor
BUILDLOC=prod

if [ "$1" = "live" ]; then
   echo "Uploading to live system.."
   #live server 1
   PEMFILE=~/Desktop/harikrishna.pem
   TARGETSERVER=ubuntu@54.186.183.28
   cp $ROSSLOC/src/app/app.config.ts.live $ROSSLOC/src/app/app.config.ts
elif [ "$1" = "-h" ]; then
   echo "Usage : vendorbuild.sh [test|live]"
   exit
else
   echo "Uploading to test server.."
   # Test server
   PEMFILE=
   TARGETSERVER=root@api.grandfinex.com

   cp $ROSSLOC/src/app/app.config.ts.test $ROSSLOC/src/app/app.config.ts
fi

DATE=`date +%Y-%m-%d-%H-%M`

cd $ROSSLOC

echo "Building..." 
ng build --$BUILDLOC > /tmp/vendorngbuild.txt

if [ -d "$ROSSLOC/dist" ];
then
  cd $ROSSLOC/dist
  echo "Creating tar.."
  tar -czf ~/Downloads/rossvendor.tar.gz *
  if [ "$1" = "live" ]; then
  echo "Copying tar to live server.."
  scp -i $PEMFILE ~/Downloads/rossvendor.tar.gz $TARGETSERVER:~/
  echo "Extracting tar in live server.."
  ssh -i $PEMFILE $TARGETSERVER  "cd /var/www/buxsuperstorevendor.com/public_html/; sudo tar -czf ~/vendor$DATE.tar.gz *;sudo rm -rf *;sudo tar -xzf ~/rossvendor.tar.gz"  
  else
   echo "Copying tar to test server.."
  scp ~/Downloads/rossvendor.tar.gz $TARGETSERVER:~/
  echo "Extracting tar in test server.."
  ssh $TARGETSERVER "cd /var/www/shopvendor.renkomarket.com/public_html; sudo tar -czf ~/vendor$DATE.tar.gz *;sudo rm -rf *;sudo tar -xzf ~/rossvendor.tar.gz"  
  fi 

  echo "Successful"
else
   echo "Build failed"
fi
