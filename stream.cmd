@echo off
setlocal
title Stream Video

set ROOT=%1


if [%ROOT%] == []	set ROOT=%CD%


cd /d "E:\Web Templates\stream-video"

npm start
