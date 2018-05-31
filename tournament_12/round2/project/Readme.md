# Judges Calendar 


### Checklist

[ + ] Realization: Create availability intervals from example data

[ + ] Realization: Query judge for his availability

[ + ] Realization: List judges that are available within time interval

[ + ] One-click launch

[ + ] Realization: ​Store repeat patterns.

[ + ] Realization: ​Deal with timezones and DST.

[+/-] Realization: ​Generate synthetic data and tests.

[ - ] Describe performance of your data storage and functions in O-notation.


### Tech Stack

Language: JavaScript (Node.js v8.11)

Database: Postgres 9.6


### File Structure

* `./service/` main code directory

    * `./service/common/` - lib/utils directory
    
        * `./service/common/db.js` - database connection wrapper
        
        * `./service/common/queries.js` - database queries
        
        * `./service/common/utils.js` - some helper functions
    
    * `./service/functions/` - our functions
    
    * `./service/app.js` - simple HTTP wragger for functions
    
    * `./service/routes.js` - HTTP routes for server
 
* `./test/` - simple unit tests

* `./scripts` - some scripts

    * `./scripts/dummy_generator.js` - generate fake data for load tests
    
    * `./scripts/import_schema.js` - import a schema.sql (run before launch a server) 
    
    * `./scripts/wait_pg.sh` - check that Postgres ready to connection

* `openapi.yml` - OpenApi (Swagger) v3 for HTTP endpoints

* `schema.sql` - SQL schema


### Database Schema

I'm purpose to use two tables: 

`judges` (with id and username) and 

`availabilities` (with reference to judges and two timestamp fields for start & end ranges)

Also "availabilities" have some indexes.

See `./schema.sql` file.


### Notes

Service transform date to GMT (UTC+0) before saving into database.

Set timezone "Europe/Kiev" for dates without explicit UTC offset (e.g. `2018-06-01T08:00` or `0 8 * * MON-FRI` will transform to GMT) .

If date passed without hours - that mean "0 hour 0 minute 0 second"

Help sites:

  * http://editor.swagger.io For API
  
  * https://crontab.guru for CRON expression
  
  * https://www.timeanddate.com/worldclock/converter.html for timezone conversion

### Start Server

_It tested with docker version 18.03 and docker-machine's version 0.14_

`docker-compose -p dc12_backend_r2 up -d`

Note: When you running the app it tried to import database schema before start http server, we waiting while database will ready for connections.
This accepts that docker might "freeze" that phase "creating dc12_backend_r2_app_1" for a couple seconds

### Stop & Remove Server

`docker-compose -p dc12_backend_r2 down`

---

### Http Endpoints

If you familiar with OpenApi (Swagger) you can open file `openapi.yml` and parse content into https://editor.swagger.io

* `POST /create`

  Except JSON with next structure:
  
  ```json
  {
    "judges": {
      "JUDGE_ONE": {
        "available": [
          {
            "start": "2018-06-03T08:00",
            "end": "2018-06-03T09:00"
          }
        ]
      },
      "JUDGE_TWO": {
        "available": [
          {
            "start": "0 8 * * MON-FRI",
            "end": "0 12 * * MON-FRI"
          }
        ]
      }
    }
  }
  ```
  
  Where 'JUDGE_USERNAME_ONE' and 'JUDGE_USERNAME_TWO' is usernames (username will transform to lower case before send query to database).
  
  JUDGE_TWO have cron-style for available range (in example above JUDGE_TWO available every working day from 8AM to 12PM). 
  
  When app detect a cron-style it create a massive of dates for the next 365 days (that not support queries into past). 
  In real app we can: 
  1) narrow or extend the max date for cron-style dates (dependents of our max limit in calendar); 
  2) save cron-pattern for users and latest available date
  3) setup cron job (runs every day) that compare latest available date (per user) and our max limit in calendar

  Example: 
  
  `curl -v -X POST -H "content-type: application/json" http://dockerhost/create --data @test/_fixtures/valid_sample1.json`
  
  Response: 
  
    HTTP Status 201 (empty body)
    
    
* `GET /fetch/{date_start}/{date_end}/{judge_name}?tz={tz}`

  `{date_start}` and `{date_end}` is an ISO8601 date
  
  `{tz}` is optional

  Example:
  
  `curl -v http://dockerhost/fetch/2018-06-01/2018-07-10/alice`
  
  Response: 
  
  ```json
  {
    "available": [
      {
        "date_start": "2018-06-01T05:00+03:00",
        "date_end": "2018-06-01T09:00+03:00"
      }
    ]
  }
  ```

* `GET /fetch/{date_start}/{date_end}?tz={tz}`

  `{date_start}` and `{date_end}` is an ISO8601 date
  
  `{tz}` is optional

  Example:
  
  `curl -v http://dockerhost/fetch/2018-06-01/2018-07-10`
  
  Response:
  
  ```json
  {
    "judges": [
      "alice",
      "bob"
    ]
  }
  ```

---

### Synthetic data generator

Run `docker exec -it dc12_backend_r2_app_1 npm run dummy_generator 100000 1`. 

First argument is quantity judges, second - quantity of availability ranges.

Generating 100_000 judges approximately takes 5 minutes (million ~ a hour)

---

### Tests

⚠️ WARNING: This remove all data in database.

Run unit tests: `docker exec -it dc12_backend_r2_app_1 npm run test`

See coverage report: `docker exec -it dc12_backend_r2_app_1 npm run coverage`
