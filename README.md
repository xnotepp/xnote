# XNote++ Thunderbird Add-on

This repository contains the code for the [Thunderbird 
XNote++](https://addons.thunderbird.net/en-US/thunderbird/addon/xnotepp/) 
add-on.

# Getting started

* You can find a build.xml for an [Ant](https://ant.apache.org/) build within 
  this directory. In order to configure it, you have to copy the 
  build.properties.ori to build.properties and do the necessary changes.

* If you configure the build process properly, the development cycle is to code, 
  stop Thunderbird, run "ant run" and check for the changes. "ant run" copies 
  the files to an extracted directory in your Thunderbird profile (see 
  build.properties), not the xpi file, deletes the "startupCache" in the profile 
  directory to force Thunderbird to consider the updated resources, and starts 
  Thunderbird.

  In some cases, e.g., changes to the HTML of the options dialog, it is 
  sufficient to run "ant deploy" to copy the files to the profile directory and 
  then try to reload the resources in Thunderbird. For the options dialog, this 
  works by closing the add-on settings dialog and reopen it.
 
* The ant build process creates a "build" directory next to the source directory 
  that will contain the add-on package in an xnote-&lt;version&gt;.xpi file. See 
  the build.xml for details. If you would like to manually install the XPI file, 
  e.g., to test the installation notice, call "ant package" to only build the 
  xpi file but not copy the sources to the TB profile.

* The build process uses JSHint to check for JavaScript errors. In order to get
  that working, install [NodeJS](https://nodejs.org/) and install JSHint
  through: `npm install -g jshint`

* If you are not yet familiar with Apache Ant, you can download it from 
  https://ant.apache.org/bindownload.cgi. Ant also requires 
  [Java](https://jdk.java.net/java-se-ri/11) to be installed on your computer. 
  After you extracted the Ant package, it's probably best to add the path to 
  your ANT_HOME/bin directory to your PATH variable so that you can call the 
  "ant" command without its full path.

* There are developer tools included in Thunderbird for debugging - menu is 
  presumably called "Tools" or "Extra" and then "developer tools" (not using the 
  English version).

---
vim:spelllang=en
