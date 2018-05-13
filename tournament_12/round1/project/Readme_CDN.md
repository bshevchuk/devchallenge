# CDN

## 1.1. What parts will be custom and what – standard.

  That part of task not completed because my docker-machine sometimes works weird :-/ 
  
  I'm planned: 
    1) use `srv` from JWT payload for determine same server that sign a upload session;
    2) use Redis to store availability and free space on device 
    3) use Redis Pub/Sub for notify replicas about new files
    4) with parsing "remote-addr" of client we can determine user's country and next redirects to instance nearest geographically. (or use any sticky-session based at Cookies)
      But this work for smart load balancer, not for proxy
    
    
## 1.2. How you will split the functionality into microservices if needed.

  Four services:
  
  * access manager - verify user and sign upload/download tokens
  
  * upload service - verify upload token and process uploaded data.
  
  * download service - download data. Maybe it would use some fast storage to caching data
  
  * sync worker (replication service) - can replicate data to other upload instances (with special token) when they not busy (or new regions)


## 1.3. How you will store and replicate information about service availability. 

  We can use Kubernetes for manager docker containers with the service. 
  
  At begin I'm prefer to use Redis - service him-self will write ALIVE each 10 secs into some key with TTL ~25 secs


## 1.4. How this will be tested.

  This a bit hard to test geo-replication (nearest server) at local machine.
  
  We can check a custom header `DEVCHALLENGE-12-BACKEND-R1` in server and compare that it the same that we expected.