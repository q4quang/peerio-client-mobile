#!/bin/sh
# stop execution on error
set -e

echo ==================== COMPILING ASSETS ====================
gulp compile

echo ================= OPTIONAL VERSION BUMP ==================
gulp bump

echo =============== BUILDING ANDROID PROJECT =================
cordova build --release android

function signapk(){
  echo ==========================================================
  echo "SIGNING: $1 => $2"
  echo ==========================================================
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore peerio.keystore $1 peerio_release_key

  echo ========== VERIFYING ==========
  jarsigner -verify -verbose -certs $1

  echo ========== ZIPALIGN ==========
  zipalign -f -v 4 $1 $2
}
mkdir -p ./bin
signapk ./platforms/android/build/outputs/apk/android-x86-release-unsigned.apk ./bin/peerio-x86.apk
signapk ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk ./bin/peerio-armv7.apk

echo ============================================
echo "||             BUILD SUCCESS              ||"
echo ============================================
