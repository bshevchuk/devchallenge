# API


# Endpoints

  Note: `dockerhost` in examples is an alias in `/etc/hosts` to docker-machine's host (see DOCKER_HOST in `docker-machine env`). 
  
  Replace it to your local environment (if needs)

## 1) Upload a File


### 1.1) Prepare upload session

  Example (cURL): 
  
  Upload a file to `nasa/milky-way.jpg`: `curl http://dockerhost/upload/prepare?path=nasa/milky-way.jpg`
  Save `token` from response (I'm prefer to store into env variable like `export DC12_UPLOAD_TOKEN=token`)


### 1.1.1) Upload single file (stream with content-length header)

  `curl -v -X POST http://dockerhost/upload/append -H "Authorization: Bearer $DC12_UPLOAD_TOKEN" -H "Content-Type: application/octet-stream" --data-binary @milky-way.jpg`
  
  Save `version.token` (`export DC12_DOWNLOAD_TOKEN=token`)

### 1.1.2) Upload chucked file (multipart/form-data with content-range headers)

  cURL not support content-range for uploading. You can use `test_chunk_upload.html` (it chunks data by 4 MB if file larger).
  
  4 Megabytes of chunk is recommended value because most Cloud Platforms allow this size of request body in their load balancer (e.g. AWS Lambda with API Gateway have limit in 6 mb, Firebase Function - 10 mb)

### 1.1.3) Upload data (transfer-encoding chunked header)

  `curl -v -X POST http://dockerhost/upload/append -H "Authorization: Bearer $DC12_UPLOAD_TOKEN" -H "Transfer-Encoding: chunked" -d "YOUR SAMPLE DADATA"`

In this case you should call `curl -v -X POST localhost:3010/upload/finish -H "Authorization: Bearer $DC12_UPLOAD_TOKEN"`
when finish

## 2) Download a File/Data

### 2.1) All content 

  `curl -v http://dockerhost/download/nasa/milky-way.jpg -H "Authorization: Bearer $DC12_DOWNLOAD_TOKEN" -o downloaded_milky-way.jpg`
  
  or open in browser URL `open http://dockerhost/download/nasa/milky-way.jpg?access_token=$DC12_DOWNLOAD_TOKEN`
  
### 2.2) Chunked range (range header)

  `curl -v http://dockerhost/download/nasa/milky-way.jpg -H "Authorization: Bearer $DC12_DOWNLOAD_TOKEN" -r 5-10`
  
  This use inclusion range (e.g. `5-10` is 5,6,7,8,9,10 bytes). 
  
  If you uploaded a file with 4mb chunk, you can verify first part like `curl {path to file} -r 0-4194303 | openssl sha256`


## See files in storage

`curl -v http://dockerhost/storage/browse` (or open in browser `http://dockerhost/storage/browse`)


## Sample Access Tokens

* upload a new version of `nasa/milky-way.jpg`

  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3QiOiJ1cGxvYWQiLCJwYXRoIjoibmFzYS9taWxreS13YXkuanBnIiwic2VzcyI6MTUyNjE1NjY2MzgzMiwic3J2IjoiOTMyYjRkYmNiYzhjOjgwODAiLCJleHAiOjE1MzQ3OTY2NjMsImlhdCI6MTUyNjE1NjY2MywiaXNzIjoiZGV2Y2hhbGxlbmdlOjEyOmJhY2tlbmQ6cjEifQ.i_Jjqsh5XbUuSWWVSuy0Fx846uJzGUq5AgGq9GsoGKU`
  
* upload a `chunk`

  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3QiOiJ1cGxvYWQiLCJwYXRoIjoiY2h1bmsiLCJzZXNzIjoxNTI2MjA1MDg5MDM3LCJzcnYiOiI5Y2I0YzAyZWMyYTE6ODA4MCIsImV4cCI6MTUzNDg0NTA4OSwiaWF0IjoxNTI2MjA1MDg5LCJpc3MiOiJkZXZjaGFsbGVuZ2U6MTI6YmFja2VuZDpyMSJ9.XH0Jr8MjrdKY3p0JqEMbjDEllE1KWRIrYmlmtq-ioEw`


## (helper commands)

See local_storage files:

`docker exec -it dc12_backend_r1_app_1 find /app/local_storage -print`
