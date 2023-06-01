# Jack's Flight Club Technical Task

## About

An application to store, retrieve, and query flight deals.
Flight deals are sent to the application regularly by multiple website scrapers.
These scrapers search Google flight, Skyscanner, Kayak etc.

## Technologies

- Node.js
- Typescript
- Express
- Prisma
- Jest
- ESLint
- Prettier

## Next steps

- Create endpoint needs protecting, will need to distribute authorisation keys to scrapers.
- Currency codes are not validated, using an invalid one will fail silently.
- A dedicated CSV parsing library should be used to replace the naive string splitting approach.

## Dependencies

Requires latest version of Node.js.

## Installation

### Install dependencies

`$ npm install`

### Create env file

Sign up to openexchangerates:
https://openexchangerates.org/signup/free

Get your app id:
https://openexchangerates.org/account/app-ids

Create a .env file with the app id in the OXR_APP_ID field.
An example `.env` is provided at `.env.example`.

### Generate Prisma client

`$ npx prisma generate`

### Migrate database

`$ npx prisma migrate dev`

## Usage

The following commands are available in package.json:

- start: starts the local dev server
- test: runs the tests
- format: formats the code base
- lint: lints the code base

For example:
`$ npm run start`

## API

### create API

The create API is an endpoint that accepts and stores data from the scrapers.
It accepts pricing data via http POST requests.
The data should be provided as `text/csv` in the body of the HTTP POST request.
The structure of the CSV data (The header row is optional):

```
URL,FlightCode,Origin,Destination,Date,Time,Duration,Cost,Currency
https://myflightwebsite.com/deal-1,IB1234,STN,MAD,2022-01-03,13:01,125,25,GBP
```

### query API

The query API is an endpoint to retrieve the best prices for a particular route.

#### `origin`: string (XXX) (required)

The airport code for the route's origin.

#### `destination`: string (XXX) (required)

The airport code for the route's destination.

#### `fromDate`: string (YYYY-MM-DD)

When provided, will only include flights after and including this date.

#### `toDate`: string (YYYY-MM-DD)

When provided, will only include flights before and including this date.

#### `fromTime`: string (hh:mm)

When provided, will only include flights after this time of day.

#### `toTime`: string (hh:mm)

When provided, will only include flights before this time of day.

#### `durationLessThan`: integer

When provided, will only include flights whose duration in minutes is less than this.

### Examples

- To query for flights between Cardiff and Heathrow:

  `GET` `localhost:3000/api/query?origin=CAR&destination=LHR`

- To query flights less than hour long in duration:

  `GET` `localhost:3000/api/query?durationLessThan=60&origin=CAR&destination=LHR`

- To query flights between a date range:

  `GET` `localhost:3000/api/query?origin=CAR&destination=LHR&fromDate=2020-03-11&toDate=2023-05-01`

- To query flights between a time range:

  `GET` `localhost:3000/api/query?origin=CAR&destination=LHR&fromTime=11:30&toTime=14:32`

- To insert rows into the database (with csv body, see above for format):

  `POST` `localhost:3000/api/create`
