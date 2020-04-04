@echo off
setlocal
title Stream Video

if [%2] == [] ( 
	
	if [%1] == [] set ROOT=%CD%
	
	if NOT [%1] == [] ( 
		if "%1" == "0" (
				set SORT=%1
				set ROOT=%CD%
				goto RUN
		)
		if "%1" == "1" (
				set SORT=%1
				set ROOT=%CD%
				goto RUN
		) 
		
		
		SET "var="&for /f "delims=0123456789" %%i in ("%1") do set var=%%i
		if defined var ( 
			set ROOT=%1
		) else ( set ROOT=%CD%)			
	)
) 
if NOT [%2] == [] ( 
	set ROOT=%1
	set SORT=%2
)

:RUN
cd /d "path/to/project/root"

echo *****WELCOME TO STREAM VIDEO*****

npm start


