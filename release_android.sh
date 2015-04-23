#!/bin/sh
set -e

gulp compile
gulp bump

cordova build --release android

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore peerio.keystore platforms/android/ant-build/MainActivity-release-unsigned.apk peerio_release_key

jarsigner -verify -verbose -certs platforms/android/ant-build/MainActivity-release-unsigned.apk

zipalign -f -v 4 platforms/android/ant-build/MainActivity-release-unsigned.apk bin/peerio.apk
