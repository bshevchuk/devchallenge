# Time Manager

SQLSchema in `./schema.sql` file.

## Server

### Stack

Language: JavaScript (Node.js v8.11)

Database: Postgres 9.6

### Structure

* `./service/` main code directory

    * `./service/common/` - lib/utils directory
        
        * `./service/common/db.js` - database connection wrapper
        
        * `./service/common/queries.js` - database queries
        
        * `./service/common/seed.js` - database schema and dymmu population
        
        * `./service/common/utils.js` - some helper functions
    
    * `./service/functions/` - our functions
    
    * `./service/app.js` - simple HTTP wragger for functions
    
    * `./service/routes.js` - HTTP routes for server
 
* `./test/` - simple unit/integration tests

* `openapi.yml` - OpenApi (Swagger) v3 for HTTP endpoints

* `schema.sql` - SQL schema

### Start Server

_It tested with docker version 18.03 and docker-machine's version 0.14_

`docker-compose -p dc12_backend_r2 up -d`

### Stop & Remove Server

`docker-compose -p dc12_backend_r2 down`

### Endpoints

If you familiar with OpenApi (Swagger) you can open `openapi.yml`.


