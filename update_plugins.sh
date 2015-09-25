#!/bin/sh

cordova plugins | grep -Eo '^[^ ]+' | while read line
do
    cordova plugin remove $line
    cordova plugin add $line
done