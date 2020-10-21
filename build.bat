REM  create a new build for xnote++- 
set /P quickFiltersWebRev=<revision.txt
set /a oldQIWebRev=%quickFiltersWebRev%
set /a quickFiltersWebRev+=1
pwsh -Command "(gc -en UTF8NoBOM manifest.json) -replace 'pre%oldQIWebRev%', 'pre%quickFiltersWebRev%' | Out-File manifest.json"
"C:\Program Files\7-Zip\7z" a -xr!.svn quickFiltersWeb.zip ./src/manifest.json ./src/_locales  ./src/chrome ./src/popup ./src/*.js ./src/license.txt ./src/release-notes.html`
echo %quickFiltersWebRev% > revision.txt
#move quickFilters*.xpi ..\..\..\_Test\5.0
pwsh -Command "Start-Sleep -m 50"
rename quickFiltersWeb.zip xnotepp-wx-3.0pre%quickFiltersWebRev%.xpi
pause