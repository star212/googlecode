echo on
echo "mission start....."

set mwpath=D:\job\httpsvntest
set username=quxing
set pwd=c
SET REPOS=%1
SET REV=%2
echo %*
pause
for %%i in (%*) do copy %%i %mwpath%
::TortoiseProc.exe command:commit path:"%*" logmsg:"test log message" closeonend:0
echo %mwpath%
pause
