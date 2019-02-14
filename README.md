# ![](https://ga-dash.s3.amazonaws.com/production/assets/logo-9f88ae6c9c3871690e33280fcf557f33.png) GraphQL

![](https://i.imgur.com/hihZUcJ.png)

## Objectives

- Understand GraphQL and why it's powerful
- Demonstrate how to compose a GraphQL schema
- Explain GraphQL queries and mutations
- Use GraphQL to interact with a mLab database
- Demonstrate how to perform CRUD on a resource
- Demonstrate how to build an association via GraphQL

<br>

## What is GraphQL?

[GraphQL Docs](https://graphql.org/)

GraphQL is a very powerful query language that communicates between browser and a server. Traditionally, a RESTful approach would have separate endpoints for `songs` and `artists`:

- GET all songs: `domain.com/songs`
- GET a single song: `domain.com/songs/:id`
- GET all artists: `domain.com/artists`
- GET a single artist: `domain.com/artists/:id`


You create different endpoints for specific pieces of data. This takes 2 requests for multiple details on each song. With Graphql we create one supercharged endpoint.

Navigate a graph to get the data then send it all back. With GraphQL you ask for exactly what you want

```js
{
	song(id: 123) {
		title
		genre
		artist {
			name
			grammys
			songs {
				name
			}
		}
	}
}
```

It looks like a graph.

![](https://cdn-images-1.medium.com/max/1600/1*EmhOknzZEu9Q6U3q5NmT9Q.png)

GraphQL is much less expensive than traditional REST-ful routing since we can request only the data we need. This is especially relevant for mobile/tablet devices that may be on a fixed data plan.

<br>

## Demo App Setup

#### Tools we're using 

- Server - Node/Express, GraphQL Server
- Database - [MongoDB Cloud Atlas](https://www.mongodb.com/cloud/atlas)
- Client (if there is time) - React, [Apollo](https://www.apollographql.com/) (glue layer, can be used with any library)

<br>

#### GraphiQL

To test our queries and mutations we'll use a browser tool called [Graphiql](https://github.com/graphql/graphiql). It's like like Postman for Graphql.

![](https://raw.githubusercontent.com/graphql/graphiql/master/resources/graphiql.png)



- Check network tab in dev tools. Request payload. Query just sent as a string
- Looks like JS but it's a query language

<br>

#### Setup

1. `mkdir bonobos-graphql && cd bonobos-graphql`
1. `mkdir server && cd server`
1. `npm init -y`
1. `touch app.js` 
1. `npm install express graphql express-graphql lodash mongoose`
	- `express-graphql` allows Express to understand graphql 
	- We'll use this as middleware
	- We'll use lodash later on to test out our queries with some dummy data
	- [Mongoose]() is an ODM (Object Document Mapper) that we'll use to connect to a MongoDB Atlas Cluster. Graphql will work with any database, we're just using MongoDB Altas Cluster so we don't have to install a DB engine.
1. `npm install -g nodemon`  (if you don't have it installed already)

```js
// app.js

const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');

const app = express();

app.use('/graphql', graphqlHTTP({

}));

app.listen(4000, () => {
    console.log('listening on port 4000');
});
```
<br>

Run `nodemon app.js` and navigate to `localhost:4000/graphql`

![](https://i.imgur.com/zFCMChY.png)

Before we move forward, our middleware needs to know what our graph looks (datatypes, properties, relationships)

<br>

## GraphQL Schema and `SongType`

Before we write our first query, we must create a GraphQL schema file. We'll put this in a separate file/directory.

1. `mkdir schema`
1. `touch schema/schema.js`

A schema:

- Defines types
- Defines relationships
- Defines root queries and mutations

```js
//schema.js

const graphql = require('graphql'); // The graphql library
const _ = require('lodash'); 

const { GraphQLObjectType, GraphQLString } = graphql;
// Using destructuring we'll bring in the Object types we want on the graph
// Describe songs and artists

const SongType = new GraphQLObjectType({
  name: 'Song',
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    genre: { type: GraphQLString }
    // Must use special graqphql datatype
  })
  // Needs to be a function for associations, to make sure everything is loaded
  // It returns an Object, avoids reference errors
});
// A function that takes in an object
```

Eventually we'll pass this file into our middleware.

<br>

## Root Query

Now that we've created a `schema.js` we can build our first query to request a single instance of a song. We'll put this code below `SongType`.

```js
// schema.js

const graphql = require('graphql');

const { GraphQLObjectType, GraphQLString, GraphQLSchema } = graphql;
// Using destructuring we'll bring in the Object types we want on the graph
// Describe songs and artists
// Grab different properties from the graphql package

	...

// What we can access in the graph, how we initially jump in
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // each field is a type of root query
    // all songs, one song, all artists, etc
    song: {
      type: SongType,
      args: { id: { type: GraphQLString } },
      // when query is made, we expect some arguments
      // to get one song we need the id
      resolve(parent, args) {
        // code to get data from the db
        // the actual Mongoose query
      }
    }    
  }  
});

module.exports = new GraphQLSchema({
  query: RootQuery
});
```
<br>

For example, client side (or in GraphiQL), the query may look like so:

```js
song(id: "2"){
	name
	genre
}
```

<br>

Finally, we need to inject the schema file into our middleware.

```js
// app.js

const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const schema = require('./schema/schema');
// import the schema file

const app = express();

app.use('/graphql', graphqlHTTP({
    schema
    // use the schema as a property in the middleware
}));

app.listen(4000, () => {
    console.log('listening on port 4000');
});
```

<br>

## Resolvers

So far, we've:

- Created a schema
- Created a Root Query
- Set up our middleware

Next, we'll define what data should be returned in our `song` query. We set this up in a **resolve** function. Here you can write raw SQL, use a ORM like Active Record or an ODM (Object Document Mapper) like Mongoose.

But before we connect to MongoDB Atlas Cloud, let's test things out with some dummy song data and lodash.


```js
const graphql = require('graphql');

const { GraphQLObjectType, GraphQLString, GraphQLSchema } = graphql;
// Using destructuring we'll bring in the Object types we want on the graph
// Describe songs and artists
// Grab different properties from the graphql packgrammys

// Dummy song data, we'll hard code the id for now
var songs = [
  {title: '7 Rings', genre: 'Pop', id: '1', artistId: '1'},
  {title: 'Without Me', genre: 'Pop', id: '2', artistId: '2'},
  {title: 'Shallow', genre: 'Rock', id: '3', artistId: '3'}
];

	...
```

<br>

#### Lodash

We'll use a package called [Lodash](https://lodash.com/) to help filter the dummy data. We installed and required this earlier.

Let's flesh out the resolve function. It defines what should be returned from the query. We'll refactor this to Mongoose later.

```js
	...
	
      resolve(parent, args) {
      	// goes out and returns what we ask for
        // code to get data from the db
        // the actual Mongoose query
        return _.find(songs, { id: args.id });
        // when we receive the request we'll find the song in the songs Array using lodash
      }
      
    ...
```

<br>


## Test Queries with GraphiQL

We have a `songType` and a RootSchema to map out the graph. If we navigate to `localhost:4000/graphql` we will now see:

<br>

![](https://i.imgur.com/Xhjd6gt.png)

<br>

So GraphQL receives the request and assumes we want some data, but we must send a query string. We aren't able to interact directly via the browser.

We can use [Graphiql](https://github.com/graphql/graphiql) to test out queries in the browser. It comes with the `express-graphql` package. To use it, we'll add a property to our middleware.

```js
// app.js

app.use('/graphql', graphqlHTTP({
    schema,
    // use the schema as a property in the middleware
    graphiql: true
    // a browser tool to test out our queries
}));
```

<br>

Check out the GraphiQL Documentation Explorer on the right. You can explore the schema and what quieries are available. Here's what a query for a song would look like. You include only the properties you want returned. NOTE - You must use double quotes.

![](https://i.imgur.com/hrkntia.png)

<br>

- Try only returning `title`
- Check out the Network tab in Dev Tools to see the GraphiQL magic
- Note in that our request is actually a `POST` request instead of a `GET`. This is because we're sending a query string to the Graphql server.

<br>

## GraphQL ID Type

Graphql is expects a query string from the client. Currently, an id sent as an Integer will not work. We can make our queries more flexible by using the `GraphQLID` datatype. 

```js
// schema.js

...

const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLSchema,
  GraphQLID 
} = graphql;

	...
```

Change the two instances of `id: { type: GraphQLString }` to `id: { type: GraphQLID }`

Now our queries will work with a String or Integer. If you `console.log(typeof args.id)` in the resolver you'll notice that `id` is still passed as a String. The ID type is for graphql's benefit.

<br>

## `ArtistType`

Let's create an `ArtistType` schema and some dummy data for artists. We'll also import `GraphQLInt` and `GraphQLList` from the `graphql` library (for `grammys` and `songs`).

```js
// schema.js

	...
	
const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList 
} = graphql;

	...
	
var artists = [
  {name: 'Ariana Grande', grammys: 4, id: '1'},
  {name: 'Halsey', grammys: 2, id: '2'},
  {name: 'Lady Gaga and Bradley Cooper', grammys: 0, id: '3'}
];
//Dummy artist data

	...
	
const ArtistType = new GraphQLObjectType({
  name: 'Artist',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    grammys: { type: GraphQLInt },
    songs: {
      type: GraphQLList(SongType),
      resolve(parent, args){
        return _.filter(songs, { artistId: parent.id } )
        // use lodash to filter a list of songs that belong to this artist
      }
    }
  })
});

	...	
```

We'll also need to add an `artist` field to our RootQuery so we may retreive data from a database for a single artist.

```js
// schema.js

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // each field is a type of root query
    // all songs, one song, all artists, etc
    song: {
      type: SongType,
      args: { id: { type: GraphQLID } },
      // when query is made, we expect some arguments
      // to get one song we need the id
      resolve(parent, args) {
        // code to get data from the db
        // the actual Mongoose query
        return _.find(songs, { id: args.id });
        // When we receive the request we'll find the song in the songs Array
      }
    },
    artist: {
      type: ArtistType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return _.find(artists, { id: args.id });
      }
    }    
  }  
})
```

Let's try an artist query in GraphiQL.

![](https://i.imgur.com/ng3sDcP.png)

<br>

## Associations: Song -> Artist

Every song has an artist and every artist has a collection of songs. There are a few steps we need to take to let Graphql know about this relationship.

We already have an `artistId` field on our songs.

```js
var songs = [
  {title: '7 Rings', genre: 'Pop', id: '1', artistId: '1'},
  {title: 'Without Me', genre: 'Pop', id: '2', artistId: '2'},
  {title: 'Shallow', genre: 'Rock', id: '3', artistId: '3'}
];
```

We'll add an `artist` property to the `SongType`. This time we'll use the `parent` argument that's passed into our resolve function. The `parent` argument is used for relationships. We'll say "find the artist that matches the `id` of the song/parent's `artistId`."

```js
const SongType = new GraphQLObjectType({
  name: 'Song',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    genre: { type: GraphQLString },
    artist: {
      type: ArtistType,
      resolve(parent, args) {
        console.log(parent);
        return _.find(artists, { id: parent.artistId });
        // the parent object is used for relationships
        // find the artist with the id of the song (parent)
      }
    }
    // Must use special graphql datatype
  })
  // Needs to be a function for associations, to make sure everything is loaded
  // It returns an Object, avoids reference errors
});
```

A song query will now return the artist.

![](https://i.imgur.com/YBGILA6.png)

<br>

## Associations: Artist -> Songs

If we query for an artist, we expect a list of songs. Earlier we imported the `GraphQLList` data type from `graphql`.

```js
// schema.js

const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList 
} = graphql;
```

We also added a songs property to our `ArtistType` which will return a list. This time we'll use the lodash `filter` method to find the songs that have the `artistId` we're looking for.

```js
// schema.js

const ArtistType = new GraphQLObjectType({
  name: 'Artist',
  fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      grammys: { type: GraphQLInt },
      songs: {
          type: new GraphQLList(SongType),
          resolve(parent, args){
            return _.filter(songs, { artistId: parent.id } );
          }
      }
  })
})
```

We need to use a function for our fields so that our artist and song types will load before we run the code top to bottom and execute.

Try a query.

![](https://i.imgur.com/igTmkQ9.png)


<br>

## YOU DO

<details>
<summary>Set up `songs` and `artists` queries in the Root Query</summary>

So far we've written root queries to return one artist or one song. What if we want to return all artists or all songs?

### Set up a songs query

We'll need to declare a `songs` property on our `RootQuery` object. We won't need an `args` property since everything is returned.

```js
// schema.js
// add to RootQuery below artist
	...
	
	    songs: {
	      type: new GraphQLList(SongType),
	      resolve(parent, args) {
	        return songs;
	      }
	    } 
	    	    
    ...

```

Try a songs query. Note that we can also return each song's artist since we've already set up the relationship.

![](https://i.imgur.com/pJ1oh3H.png)

<br>

### Set up an artists query

```js
    artists: {
      type: new GraphQLList(ArtistType),
      resolve(parent, args) {
        return artists;
      }
    }  
```

Try an artists query. Note that we may also return each artist's songs since we've already set up the relationship.

![](https://i.imgur.com/SaGmdOe.png)


<br>

</details>

## Connecting to MongoDB Atlas

In order to build Mutations to create, update and delete we'll need to persist our data instead of hard coding it. Graphql can be used with any database, but today we're gonna use MongoDB Atlas.

- Signup for a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Note - You may need to create an Organization and a Project the first time
- Create a Free Tier cluster
- Database Name: `bonobos-graphql-app`
- Once the cluster is initialized, click on `CONNECT`

![](https://i.imgur.com/WcSIIuL.png)

- Whitelist your IP, then create a MongoDB User with a `Username` and `Password`. Click on `Choose a connection method`

![](https://i.imgur.com/VJm9zsK.png)

- Select `Connect Your Application`

![](https://i.imgur.com/D4Jo4Yn.png)

- Click on `Short SRV connection string` and copy the SRV Address. You'll replace `<USERNAME>:<PASSWORD>` with your credentials.

![](https://i.imgur.com/8nBlTMD.png)

<br>

#### Connect the App to the MongoDB cluster

Now that we've created a cluster, let's connect it to our app.

- Make sure your connection string from the previous step is copied. It'll look something like this:
	- `mongodb+srv://marcwright:<PASSWORD>@cluster0-q30gy.mongodb.net/test?retryWrites=true` 

- We've already installed and required `mongoose`. In `app.js` we'll use a few of it's methods to connect to MongoDB Atlas.	

```js
const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const schema = require('./schema/schema');
// import the schema file


const app = express();

mongoose.connect('mongodb+srv://<USERNAME>:<PASSWORD>@cluster0-q30gy.mongodb.net/test?retryWrites=true', { useNewUrlParser: true });
// Add your SRV connection string here

mongoose.connection.once('open', () => {
    console.log('connected to MongoDB Atlas database');
});
// Check our connection to MongoDB Atlas
```

<br>

## Seed MongoDB Atlas

Mongo itself is schemaless. It's like a junk drawer. It'll store anything. 

However, we need to create a Mongoose schema/model so the Mongoose methods know what the database documents look like. Note - this is completely separate from the Graphql schema we created earlier.

Here, we're defining model, or blueprint, for what each Artist and Song should look like in the database. Mongo will automatically create a new collection if one doesn't exist and assign an `_id` for us.

1. In the main `server` directory, `touch seeds.js`

```js
// seeds.js

const mongoose = require('mongoose');

const ArtistMongooseModel = mongoose.model('Artist', {
  name: String,
  grammys: Number
});
const SongMongooseModel = mongoose.model('Song', {
  title: String,
  genre: String,
  artistId: String
});

const songs = [
  {title: '7 Rings', genre: 'Pop'},
  {title: 'Without Me', genre: 'Pop'},
  {title: 'Shallow', genre: 'Rock'}
];

const artists = [
  {name: 'Ariana Grande', grammys: 4},
  {name: 'Halsey', grammys: 2},
  {name: 'Lady Gaga and Bradley Cooper', grammys: 0}
];

function seedSongsAndArtists() {  
  artists.forEach((artist, index) => {
    ArtistMongooseModel.create(artist)
      .then(newArtist => {
        var newSong = new SongMongooseModel(songs[index]);
        newSong.artistId = newArtist.id;
        return newSong.save();
      });
  });
}

mongoose.connect('mongodb+srv://dieselwright:Password123!@cluster0-q30gy.mongodb.net/test?retryWrites=true', { useNewUrlParser: true });

mongoose.connection.once('open', () => {
  console.log('connected to MongoDB Atlas database');
  return seedSongsAndArtists();
});
```

1. In the Terminal, run `node seeds.js`
2. If you click on `Collections` you will have `songs` and `artists` collections.

![](https://i.imgur.com/5rtY0FH.png)

<br>

#### Add Mongoose to the resolvers in the Root Query

Let's refactor our 6 lodash methods into Mongoose methods.

```js
const graphql = require('graphql');
const mongoose = require('mongoose');

const ArtistMongooseModel = mongoose.model('Artist', {
  name: String,
  grammys: Number
});
const SongMongooseModel = mongoose.model('Song', {
  title: String,
  genre: String,
  artistId: String
});

const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList 
} = graphql;

const SongType = new GraphQLObjectType({
  name: 'Song',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    genre: { type: GraphQLString },
    artist: {
      type: ArtistType,
      resolve(parent, args) {
        console.log(parent);
        return ArtistMongooseModel.findById(parent.artistId);
      }
    }
  })
});

const ArtistType = new GraphQLObjectType({
  name: 'Artist',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    grammys: { type: GraphQLInt },
    songs: {
      type: new GraphQLList(SongType),
      resolve(parent, args){
        return SongMongooseModel.find({ artistId: parent.id });
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    song: {
      type: SongType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return SongMongooseModel.findById(args.id);
      }
    },
    artist: {
      type: ArtistType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return ArtistMongooseModel.findById(args.id);
      }
    },
    songs: {
      type: new GraphQLList(SongType),
      resolve(parent, args) {
        return SongMongooseModel.find();
      }
    },
    artists: {
      type: new GraphQLList(ArtistType),
      resolve(parent, args) {
        return ArtistMongooseModel.find();
      }
    }        
  }  
});

module.exports = new GraphQLSchema({
  query: RootQuery
});
```

To test this out, make sure to use the `_id` that MongoDB Atlas assigned to each document.

![](https://i.imgur.com/3nNmMAb.png)

<br>

## Mutations - `addArtist`

GraphQL Mutations allow us to change or mutate our data. They're similar to the query pattern. We define what we're expecting from the user.

1. Create a `const Mutation` object like RootQuery
2. Give it a `name` property
1. Define a `fields` object property
2. Define args or what we're expecting from the user
3. Add mongoose magic to resolve
4. Make sure to return the `artist.save()`
4. `module.exports` the Mutation

```js
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addArtist: {
      type: ArtistType,
      args: { 
        name: { type: GraphQLString },
        grammys: { type: GraphQLInt }
      },
      resolve(parent, args){
        //Mongoose
        let artist = new ArtistMongooseModel({
          name: args.name,
          grammys: args.grammys
        });

        return artist.save();
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
```
<br>

Try a mutation. The body defines what properties we want returned to us.

![](https://i.imgur.com/oiQG79g.png)

<br>

## Mutations - `addSong`

```js
    addSong: {
      type: SongType,
      args: { 
        title: { type: GraphQLString },
        genre: { type: GraphQLString },
        artistId: { type: GraphQLID }
      },
      resolve(parent, args){
        //Mongoose
        let song = new SongMongooseModel({
          title: args.title,
          genre: args.genre,
          artistId: args.artistId
        });

        return song.save();
      }
    }
```

<br>

![](https://i.imgur.com/ZpSs7ZD.png)

Add a few more songs and artists.

<br> 


## Update the Resolve Functions with Mongoose

<details>
<summary>If we didn't have time for this earlier</summary>

```js
// songType artist property
return ArtistMongooseModel.findById(parent.artistId);

// artistType songs property
return SongMongooseModel.find({ artistId: parent.id });

// RootQuery song
return SongMongooseModel.findById(args.id);

// RootQuery artist
return ArtistMongooseModel.findById(args.id);

// RootQuery songs
return SongMongooseModel.find({});

// RootQuery artists
return ArtistMongooseModel.find({});
```

</details>

<br>

## GraphQL NonNull

Add `GraphQLNonNull` for validation.

```js
const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull 
} = graphql;
```

Then wrap the mutation fields.

```js
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addArtist: {
      type: ArtistType,
      args: { 
        name: { type: new GraphQLNonNull(GraphQLString) },
        grammys: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(parent, args){
        //Mongoose
        let artist = new ArtistMongooseModel({
          name: args.name,
          grammys: args.grammys
        });

        return artist.save();
      }
    },
    addSong: {
      type: SongType,
      args: { 
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        artistId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parent, args){
        //Mongoose
        let song = new SongMongooseModel({
          title: args.title,
          genre: args.genre,
          artistId: args.artistId
        });

        return song.save();
      }
    }
  }
});
```

<br>

## Delete a song

```js
	deleteSong: {
      type: SongType,
      args: {
        id: { type: GraphQLString }
      },
      resolve(parent, args){
        return SongMongooseModel.findByIdAndDelete(args.id);
      }
    }
```

<br>

## Update a song

```js
    updateSong: {
      type: SongType,
      args: { 
        id: { type: GraphQLString },
        title: { type: GraphQLString },
        genre: { type: GraphQLString },
        artistId: { type: GraphQLID }
      },
      resolve(parent, args){
        return SongMongooseModel.findByIdAndUpdate(args.id, args, { new: true });
      }
    }
```


<br>

## Add a React/Apollo Front-end

We've confirmed that we're able to make a query and get the data back from MongoDB Atlas. Now, let's replace GraphiQL with a React/Apollo front end.

[Apollo](https://www.apollographql.com/) will bind Graphql to our React app. It'll let us make queries from the front end.

FYI- there is a similar libray that Facebook curates called [Relay](https://facebook.github.io/relay/). There are alot of opinions out there.

<br>

## Create React App

1. `cd` into the main app directory where the `server` lives.
2. `create-react-app client`
3. `cd client && npm start`

We'll clean up these files a bit.

```js
// App.js

import React, { Component } from 'react';

class App extends Component {
  render() {
    return (
      <div className="App">
       
      </div>
    );
  }
}

export default App;
```
```js
// index.js

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

Also, delete `App.css`, the service worker file and the logo file.

```js
// index.css

body {
  background-color: #eee;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif
}
```

<br>

## `SongList` Component

1. `touch src/SongList.js`

```jsx
// src/SongList.js

import React, { Component } from 'react';

class SongList extends Component {
  render() {
    return (
      <div>
        <ul>
          <li>Song List</li>
        </ul>      
      </div>
    );
  }
}

export default SongList;
```
<br>

```jsx
// App.js

import React, { Component } from 'react';
import SongList from './SongList';

class App extends Component {
  render() {
    return (
      <div>
        <h1>Marc's Song List</h1>       
        <SongList />
      </div>
    );
  }
}

export default App;
```

<br>

## Apollo Client Setup

- [Apollo](https://www.apollographql.com/)
- [Apollo and React Getting Started](https://www.apollographql.com/docs/react/essentials/get-started.html)

Can be used with other libraries.

12. `npm install apollo-boost react-apollo graphql`

```jsx
// App.js

import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
// combines several packages we need
import { ApolloProvider } from 'react-apollo';
// wraps our app and injects the apolloclient info

import SongList from './SongList';

// apollo client setup

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql'
  // tell apollo the graphql endpoint
}) 

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div>
          <h1>Marc's Song List</h1>      
          <SongList />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
```

<br>

## Connect React/Apollo Client to the GraphQL Server

Makes queries to the server from frontend

[Apollo](https://www.apollographql.com/docs/react/essentials/get-started.html)

- We need to construct the query
- Then bind it to the component so we have access to the data

First, to create queries we need to import a packge called `gql`. We'll also console.log our props


```jsx
// SongList.js

import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

// construct the query
const getSongsQuery = gql`
  {
    songs{
      title
      id
    }    
  }
`

class SongList extends Component {
  render() {
  
  	console.log(this.props)
  	
    return (
      <div>
        <ul>
          <li>Song List</li>
        </ul>      
      </div>
    );
  }
}

// bind this query to this component
// the data will be stored in the component's props
export default graphql(getSongsQuery)(SongList);
```

<br>

#### CORS

If you check the browser console, we will get CORS errors. This is a good sign! Let's fix that on the **server**.

- `npm install cors`

```js
// server/app.js

const cors = require('cors');

...

const app = express();

// allow cross-origin requests
app.use(cors());
```

If you check the browser console now you should see two new properties. A songs property and a loading property.

You will see the data object loading twice. Once when the data is `loading: true` and again once data is `loading: false`.

![](https://i.imgur.com/fIy4Pi3.png)

<br>

## Rendering songs in the `SongList` component

We can use the fetching property to know when to add data to the component.
If you check the console we'll get an error saying we need to add a `key` prop to each element.

```jsx
// SongList.js

...

class SongList extends Component {
  displaySongs() {
    let data = this.props.data;

    if (data.loading) {
      return( <div>Loading songs...</div> );
    } else {
      return data.songs.map(song => {
        return( <li key={song.id}>{song.title}</li> );
      })
    }
  }

  render() {
    console.log(this.props)
    return (
      <div>
        <ul>
          { this.displaySongs() }
        </ul>      
      </div>
    );
  }
}
...

```

<br>

## `AddSong` Component

1. `touch src/AddSong.js`

```jsx
// AddSong.js

import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

// construct the query
const getArtistsQuery = gql`
  {
    artists{
      name
      id
    }    
  }
`

class AddSong extends Component {
  
  displayArtists() {
    let data = this.props.data;

    if (data.loading) {
      return( <option>Loading artists...</option> );
    } else {
      return data.artists.map(artist => {
        return( <option key={artist.id} value={artist.id}>{ artist.name }</option> )
      })
    }
  }

  render() {   
    return (
      <form>
        <div className="field">
          <label>Song Title:</label>
          <input type="text"/>
        </div>
        <div className="field">
          <label>Genre:</label>
          <input type="text"/>
        </div>
        <div className="field">
          <label>Artist:</label>
          <select>
            <option>Select Artist</option>
            { this.displayArtists() }
          </select>
        </div>
        <button>+</button>
      </form>
    );
  }
}

// bind this query to this component
// the data will be stored in the component's props
export default graphql(getArtistsQuery)(AddSong);
```

Also, import this new component in `App.js`

```jsx
import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
// combines several packages we need

import { ApolloProvider } from 'react-apollo';
// wraps our app and injects the apolloclient info

import SongList from './SongList';
import AddSong from './AddSong';

// apollo client setup

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql'
  // tell apollo the graphql endpoint
}) 

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div>
          <h1>Marc's Song List</h1>       
          <SongList />
          <AddSong />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
```

<br>

## External Query File

1. `touch src/queries.js`
1. Move the gql queries to the new file
1. Import the new file

```jsx
// queries.js

import { gql } from 'apollo-boost';

// construct the query
const getArtistsQuery = gql`
  {
    artists{
      name
      id
    }    
  }
`

// construct the query
const getSongsQuery = gql`
  {
    songs{
      title
      id
    }    
  }
`

export { getArtistsQuery, getSongsQuery }; 
```
<br>

```js
// SongList.js

import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { getSongsQuery } from './queries';

...

```
<br>

```js
// AddSong.js

import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { getArtistsQuery } from './queries';

...

```

<br>

## Updating Component State With Song Form Input

```js
// AddSong.js

import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { getArtistsQuery } from './queries';

class AddSong extends Component {
  constructor(props) {
    super()

    this.state = {
      title: '',
      genre: '',
      artistId: ''
    }
  }

  displayArtists() {
    let data = this.props.data;

    if (data.loading) {
      return( <option>Loading artists...</option> );
    } else {
      return data.artists.map(artist => {
        return( <option key={artist.id} value={artist.id}>{ artist.name }</option> )
      })
    }
  }

  submitForm(e) {
    e.preventDefault();
    console.log(this.state);
  }   

  render() {
    return (
      <form onSubmit={this.submitForm.bind(this)}>
        <div>
          <label>Song Title:</label>
          <input type="text" onChange={(e) => this.setState({title: e.target.value})}/>
        </div>
        <div>
          <label>Genre:</label>
          <input type="text" onChange={(e) => this.setState({genre: e.target.value})} />
        </div>
        <div>
          <label>Artist:</label>
          <select onChange={(e) => this.setState({artistId: e.target.value})}>
            <option>Select Artist</option>
            { this.displayArtists() }
          </select>
        </div>
        <button>+</button>
      </form>
    );
  }
}

export default graphql(getArtistsQuery)(AddSong);
```

<br>

## Apollo Mutations

We're updating state in the console. Let's actually mutate that data.

1. Add a mutation to `queries.js`

	```js
	const addSongMutation = gql`
	  mutation{
	    addSong(title: "", genre: "", artistId: ""){
	      title
	      id
	    }
	  }
	`
	
	...
	
	export { getArtistsQuery, getSongsQuery, addSongMutation }; 
	```

1. In `AddSong.js` we'll import `compose` to bind multiple queries/mutations to one component.

	```js
	import { graphql, compose } from 'react-apollo';
	import { getArtistsQuery, addSongMutation } from './queries';
	
	...
	
	export default compose(
	  graphql(getArtistsQuery, { name: "getArtistsQuery" }),
	  graphql(addSongMutation, { name: "addSongMutation" })
	)(AddSong);
	```

1. If you `console.log(this.props)` in the render method you will see the queries/mutations. We can grab the array of artists from `getartistsQuery`.

	```js
	...
	
	 displayArtists() {
	    let data = this.props.getArtistsQuery;
	
	...
	```

1. We can also update the mutation. It'll create an empty document in MongoDB Atlas, but we aren't yet passing in values.

	```js
	...
	
	 submitForm(e) {
	    e.preventDefault();
	    this.props.addSongMutation()
	
	  } 
	
	...
	```

<br>


## Query Variables

1. Update the mutation with query variables. The `!` means not null.

	```js
	// queries.js
	
	const addSongMutation = gql`
	  mutation($title: String!, $genre: String!, $artistId: ID!){
	    addSong(title: $title, genre: $genre, artistId: $artistId){
	      title
	      id
	    }
	  }
	`
	```
	
1. Update `submitForm`

	```js
	  submitForm(e) {
	    e.preventDefault();
	    this.props.addSongMutation({
	      variables: {
	        title: this.state.title,
	        genre: this.state.genre,
	        artistId: this.state.artistId
	      }
	    })
	  } 
	```

This will persist to MongoDB Apollo, but it isn't yet updating the DOM!

<br>

## Refetching Queries

Import `getSongsQuery` from `queries.js`.

```js
// AddSong.js

import { getArtistsQuery, addSongMutation, getSongsQuery } from './queries';
...

  submitForm(e) {
    e.preventDefault();
    this.props.addSongMutation({
      variables: {
        title: this.state.title,
        genre: this.state.genre,
        artistId: this.state.artistId
      },
      refetchQueries: [{ query: getSongsQuery }]
    })
  }  
```

<br>

## `SongDetails` Component

1. `touch src/components/songDetails.js`

```jsx
// songDetails.js

import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { getsongQuery } from '../queries/queries';

class songDetails extends Component {
  render() {
    return (
      <div id="song-details">
        <p>Output song Details here</p>
      </div>
    );
  }
}

export default graphql(getsongQuery)(songDetails);
```


```js
// queries.js

const getsongQuery = gql`
  query($id: ID){
    song(id: $id){
      id
      name
      genre
      artist{
        id
        name
        grammys
        songs{
          name
          id
        }
      }
    }
  }
`

...

export { getartistsQuery, getsongsQuery, addsongMutation, getsongQuery }; 
```

```jsx
// songList.js

...

import songDetails from './songDetails';

...

  render() {
    console.log(this.props)
    return (
      <div>
        <ul id="song-list">
          { this.displaysongs() }
        </ul>      
        <songDetails />
      </div>
    );
  }
```

<br>


## Query a Single Record

