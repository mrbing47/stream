@echo off
title Stream Video


set "var="&for /f "delims=0123456789" %%i in ("%1") do set var=%%i
if NOT defined var ( 
	set PORT=%1
    set ROOT=%CD%
) else ( 
    set ROOT=%1
    set "var="&for /f "delims=0123456789" %%i in ("%2") do set var=%%2
    if NOT defined var (
        set PORT=%2)
)	


cd /d "path/to/project/root"

echo *****WELCOME TO STREAM VIDEO*****
echo ** Starting at %ROOT% **

npm start


