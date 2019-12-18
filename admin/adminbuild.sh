#!/bin/bash

ROSSLOC=/var/www/html/ross/admin
BUILDLOC=prod

if [ "$1" = "live" ]; then
   echo "Uploading to live system.."
   #live server 1
   PEMFILE=~/Desktop/harikrishna.pem
   TARGETSERVER=ubuntu@54.186.183.28
   cp $ROSSLOC/src/app/app.config.ts.live $ROSSLOC/src/app/app.config.ts
elif [ "$1" = "-h" ]; then
   echo "Usage : adminbuild.sh [test|live]"
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
ng build --$BUILDLOC > /tmp/adminngbuild.txt

if [ -d "$ROSSLOC/dist" ];
then
  cd $ROSSLOC/dist
  echo "Creating tar.."
  tar -czf ~/Downloads/rossadmin.tar.gz *
  if [ "$1" = "live" ]; then
  echo "Copying tar to live server.."
  scp -i $PEMFILE ~/Downloads/rossadmin.tar.gz $TARGETSERVER:~/
  echo "Extracting tar in live server.."
  ssh -i $PEMFILE $TARGETSERVER  "cd /var/www/buxsuperstoreadmin.com/public_html; sudo tar -czf ~/admin$DATE.tar.gz *;sudo rm -rf *;sudo tar -xzf ~/rossadmin.tar.gz"  
  else
  echo "Copying tar to test server.."
  scp ~/Downloads/rossadmin.tar.gz $TARGETSERVER:~/
  echo "Extracting tar in test server.."
  ssh $TARGETSERVER "cd /var/www/shopadmin.renkomarket.com/public_html; sudo tar -czf ~/admin$DATE.tar.gz *;sudo rm -rf *;sudo tar -xzf ~/rossadmin.tar.gz"  
  fi 
  
  echo "Successful"
else
   echo "Build failed"
fi
