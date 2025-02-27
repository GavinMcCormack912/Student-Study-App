# Boiler Groups
Study app for CS 307 using MongoDB, Express.js, React Native, and Node.js

## Launch Instructions

Clone the repository
```
git clone https://github.com/GavinMcCormack912/Student-Study-App.git
```

Get server dependencies
```
cd server
npm install
```

Get client dependencies
```
cd client
npm install
```

Create a .env file in server with the following fields filled in
```
MONGO_URI=
PORT=
NODE_ENV=
JWT_SECRET=
```

Create a .env file in client with the following fields filled in
```
API_URL=
```

Start the server and client on separate terminals and open the application
```
cd server
npm start
```
```
cd client
npm start
```

## Testing
Server tests are ran with Mocha. Insert test files in `server/test`. Run tests with
```
cd server
npm test
```