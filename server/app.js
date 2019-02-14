const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const schema = require('./schema/schema');
const cors = require('cors');

const app = express();

app.use(cors());

mongoose.connect('mongodb+srv://dieselwright:Password123!@cluster0-wym0l.mongodb.net/test?retryWrites=true', { useNewUrlParser: true });

mongoose.connection.once('open', () => {
  console.log('connected to MongoDB Atlas database');
});

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.listen(4000, () => {
    console.log('listening on port 4000');
});