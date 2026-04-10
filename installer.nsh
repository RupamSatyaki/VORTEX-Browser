; installer.nsh — Vortex Browser Windows Default Browser Registration

!macro customInstall
  ; ── HKLM — Machine-wide registration ────────────────────────────────────

  ; ProgID for HTML files
  WriteRegStr HKLM "SOFTWARE\Classes\VortexHTML" "" "Vortex HTML Document"
  WriteRegStr HKLM "SOFTWARE\Classes\VortexHTML\Application" "ApplicationName" "Vortex"
  WriteRegStr HKLM "SOFTWARE\Classes\VortexHTML\Application" "ApplicationIcon" "$INSTDIR\Vortex.exe,0"
  WriteRegStr HKLM "SOFTWARE\Classes\VortexHTML\Application" "AppUserModelId" "com.vortex.browser"
  WriteRegStr HKLM "SOFTWARE\Classes\VortexHTML\DefaultIcon" "" "$INSTDIR\Vortex.exe,0"
  WriteRegStr HKLM "SOFTWARE\Classes\VortexHTML\shell" "" "open"
  WriteRegStr HKLM "SOFTWARE\Classes\VortexHTML\shell\open\command" "" '"$INSTDIR\Vortex.exe" "%1"'

  ; ProgID for HTTP URLs
  WriteRegStr HKLM "SOFTWARE\Classes\VortexURL" "" "Vortex URL"
  WriteRegStr HKLM "SOFTWARE\Classes\VortexURL" "URL Protocol" ""
  WriteRegStr HKLM "SOFTWARE\Classes\VortexURL\DefaultIcon" "" "$INSTDIR\Vortex.exe,0"
  WriteRegStr HKLM "SOFTWARE\Classes\VortexURL\shell" "" "open"
  WriteRegStr HKLM "SOFTWARE\Classes\VortexURL\shell\open\command" "" '"$INSTDIR\Vortex.exe" "%1"'

  ; StartMenuInternet registration (required for Default Apps)
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex" "" "Vortex"
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\DefaultIcon" "" "$INSTDIR\Vortex.exe,0"
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\InstallInfo" "IconsVisible" 1
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\shell\open\command" "" '"$INSTDIR\Vortex.exe"'

  ; Capabilities
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities" "ApplicationName" "Vortex"
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities" "ApplicationDescription" "Fast, feature-rich Electron-based browser"
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities" "ApplicationIcon" "$INSTDIR\Vortex.exe,0"
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities\FileAssociations" ".htm"   "VortexHTML"
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities\FileAssociations" ".html"  "VortexHTML"
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities\FileAssociations" ".xhtml" "VortexHTML"
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities\URLAssociations" "http"    "VortexURL"
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities\URLAssociations" "https"   "VortexURL"
  WriteRegStr HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities\URLAssociations" "ftp"     "VortexURL"

  ; Register in Windows RegisteredApplications
  WriteRegStr HKLM "SOFTWARE\RegisteredApplications" "Vortex" "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities"

  ; ── HKCU — Per-user registration (Windows 10/11 Default Apps uses this) ──

  WriteRegStr HKCU "SOFTWARE\Classes\VortexHTML" "" "Vortex HTML Document"
  WriteRegStr HKCU "SOFTWARE\Classes\VortexHTML\DefaultIcon" "" "$INSTDIR\Vortex.exe,0"
  WriteRegStr HKCU "SOFTWARE\Classes\VortexHTML\shell\open\command" "" '"$INSTDIR\Vortex.exe" "%1"'

  WriteRegStr HKCU "SOFTWARE\Classes\VortexURL" "" "Vortex URL"
  WriteRegStr HKCU "SOFTWARE\Classes\VortexURL" "URL Protocol" ""
  WriteRegStr HKCU "SOFTWARE\Classes\VortexURL\DefaultIcon" "" "$INSTDIR\Vortex.exe,0"
  WriteRegStr HKCU "SOFTWARE\Classes\VortexURL\shell\open\command" "" '"$INSTDIR\Vortex.exe" "%1"'

  WriteRegStr HKCU "SOFTWARE\Clients\StartMenuInternet\Vortex" "" "Vortex"
  WriteRegStr HKCU "SOFTWARE\Clients\StartMenuInternet\Vortex\DefaultIcon" "" "$INSTDIR\Vortex.exe,0"
  WriteRegStr HKCU "SOFTWARE\Clients\StartMenuInternet\Vortex\shell\open\command" "" '"$INSTDIR\Vortex.exe"'
  WriteRegStr HKCU "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities" "ApplicationName" "Vortex"
  WriteRegStr HKCU "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities" "ApplicationDescription" "Fast, feature-rich Electron-based browser"
  WriteRegStr HKCU "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities\FileAssociations" ".htm"   "VortexHTML"
  WriteRegStr HKCU "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities\FileAssociations" ".html"  "VortexHTML"
  WriteRegStr HKCU "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities\URLAssociations" "http"    "VortexURL"
  WriteRegStr HKCU "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities\URLAssociations" "https"   "VortexURL"

  WriteRegStr HKCU "SOFTWARE\RegisteredApplications" "Vortex" "SOFTWARE\Clients\StartMenuInternet\Vortex\Capabilities"

  ; Notify Windows shell of changes
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'

!macroend

!macro customUnInstall
  DeleteRegKey HKLM "SOFTWARE\Classes\VortexHTML"
  DeleteRegKey HKLM "SOFTWARE\Classes\VortexURL"
  DeleteRegKey HKLM "SOFTWARE\Clients\StartMenuInternet\Vortex"
  DeleteRegValue HKLM "SOFTWARE\RegisteredApplications" "Vortex"

  DeleteRegKey HKCU "SOFTWARE\Classes\VortexHTML"
  DeleteRegKey HKCU "SOFTWARE\Classes\VortexURL"
  DeleteRegKey HKCU "SOFTWARE\Clients\StartMenuInternet\Vortex"
  DeleteRegValue HKCU "SOFTWARE\RegisteredApplications" "Vortex"

  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
!macroend
