# Jack's Flight Club Technical Task

Your task is to write an application to store, retrieve, and query flight deals. Flight deals will be sent to your application regularly by multiple website scrapers. These scrapers search Google flight, Skyscanner, Kayak etc.

The application should:
1. Expose an API endpoint that accepts and stores data from the scrapers.
2. Expose an API endpoint to retrieve the best prices for a particular route
3. The prices should be persisted to a database

## Requirements for the create API

The create API (See 1. above) should accept pricing data via http POST requests. The data will be provided as `text/csv` in the body of the HTTP POST request.

The structure of the CSV data (The header row is optional):
```
URL,FlightCode,Origin,Destination,Date,Time,Duration,Cost,Currency
https://myflightwebsite.com/deal-1,IB1234,STN,MAD,2022-01-03,13:01,125,25,GBP
```

This data should be persisted in a database.

## Requirements for query API (See 2. above):
Expose a query API that:
* Can find the lowest price for a flight route within a date range
* Can find flights only at certain times of day
* Can find long haul/short haul flights only (duration less than X)
* Can return only the cheapest deal for identical flights

## Technologies
The exactly technology and framework choices are left mostly to the writer, however we would like to see:
* Predominately JS or Typescript implementation
* A database (Either SQL, or NoSQL)

## Submission
Your submission should include:
* Code
* Example test data
* Example queries
* Running instructions (including required dependencies)
* Any notes you have about your submission
