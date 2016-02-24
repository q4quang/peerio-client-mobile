#!/bin/sh
echo '=== REINSTALLING PLATFORMS AND PLUGINS'

echo '=== Removing plugins...'
rm -rf plugins
echo '=== Removing platforms...'
rm -rf platforms

echo '=== Adding IOS platform'
cordova platform add ios

echo '=== Adding ANDROID platform'
cordova platform add android

echo '=== Applying platform project settings'
gulp prepare

echo '=== DONE!'