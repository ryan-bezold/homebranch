# Homebranch
A self hosted ebook management backend

### Dependencies
- An [authentication service](http://github.com/Hydraux/authentication)
- A PostgreSQL database

### Setup
- Environment variables must be set for the Postgres database connection.
- The JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be the same as the authentication service's

1. Install dependencies using `npm i --omit-dev`
2. Build using `npm run build`
3. Run using `node main.js`