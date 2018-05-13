# Dump storage


## Task

 Write a server, which will handle chunked upload of big files with token authentication and versioning.


## Stack: 

* Node.JS 8.11 - have good support of streaming data and supported by most cloud platforms

* MongoDB 3.6 - Document NoSQL for store file metadata


## Info

I'm use JWT token because this allow issue and verify without any centralized storage. 

App have two token types - one for uploading a file to specific path, other for retrieve a specific version of the file (issue when complete uploading sessions) 

Each uploaded chunk (or file) stored into local_storage with sha256-sum (by content) as file name (in long-term it should reduce a disk space when user uploads a file with changing at the end)

# Application Server

Source code in `./server/` sub-directory

## Start The Server

_It tested with docker version 18.03 and docker-machine's version 0.14_

`docker-compose -p dc12_backend_r1 up -d`


## Stop & Remove The App Server

`docker-compose -p dc12_backend_r1 down`


# API Documentation

Please see a file `Readme_Api.md`


My thinks about CDN in `Readme_CDN.md`
