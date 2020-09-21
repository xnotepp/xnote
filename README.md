# XNote++ Thunderbird Add-on

This repository contains the code for the Thunderbird XNote++ add-on: https://addons.thunderbird.net/en-US/thunderbird/addon/xnotepp/


# Getting started

* You can find a build.xml for an Ant build within this directory. In order to configure it, you have to copy the build.properties.ori to build.properties and do the necessary changes.
* If you configure the build process properly, the development cycle is to code, stop Thunderbird, run "ant" (default target = "all" that also copies files to your Thunderbird profile directory - you should establish a separate development profile), start Thunderbird and check for the changes.
* There are developer tools included in Thunderbird for debugging - menu is presumably called "Tools" or "Extra" and then "developer tools" (not using the English version).

# Notes

To trigger reinstallation in TB, delete the folder "startupCache" in
the profile directory.

---
vim:spelllang=en
