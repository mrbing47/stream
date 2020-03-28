@echo off
setlocal
title Stream Video

set ROOT=%1


if [%ROOT%] == []	set ROOT=%CD%


cd /d "path/to/project/root"

npm start
