peerio-client-mobile
=============

Peerio mobile clients

git config core.ignorecase false

We use specifically node v4 (node v5 breaks the build)

npm install bower bower-installer gulp -g -d

npm install -g cordova@5.3.3

npm install -g ios-deploy # for MacOSX using sudo causes an error, removed

xcode-select --install # if you don't already have console tools for XCode you would need this line

npm install -d # install or update all packages

bower install

bower-installer

cordova platform add ios android # this will generate all the required project files for both platforms

sudo gem install github_changelog_generator

chmod a+x ./generate_changelog.sh ./release_android.sh

notes
============
xwalk will not work without these permissions
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
