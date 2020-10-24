# XNote++ Thunderbird Add-on

This repository contains the code for the [Thunderbird 
XNote++](https://addons.thunderbird.net/en-US/thunderbird/addon/xnotepp/) 
add-on.

# Getting started

* You can find a build.xml for an [Ant](https://ant.apache.org/) build within 
  this directory. In order to configure it, you have to copy the 
  build.properties.ori to build.properties and do the necessary changes.

* If you configure the build process properly, the development cycle is to code, 
  stop Thunderbird, run "ant deploy" (default target = "package", but "deploy" 
  also copies files to your Thunderbird profile directory - you should establish 
  a separate development profile), start Thunderbird and check for the changes. 
  "ant deploy" copies the files to an extracted directory, not the xpi file, and 
  also deletes the "startupCache" in the profile directory to force Thunderbird 
  to consider the updated resources.
 
* The ant build process creates a "build" directory next to the source directory 
  that will contain the add-on package in an xnote-&lt;version&gt;.xpi file. See 
  the build.xml for details.

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
