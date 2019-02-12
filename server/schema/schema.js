const graphql = require('graphql');
// The actual package
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistSchema = new Schema({
  name: String,
  grammys: Number
});

const songSchema = new Schema({
  title: String,
  genre: String,
  artistId: String
});

const ArtistMongooseModel = mongoose.model('Artist', artistSchema);
const SongMongooseModel = mongoose.model('Song', songSchema);

const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList 
} = graphql;
// Using destructuring we'll bring in the Object types we want on the graph
// Describe songs and artists

var songs = [
  {title: '7 Rings', genre: 'Pop', id: '1', artistId: '1'},
  {title: 'Without Me', genre: 'Pop', id: '2', artistId: '2'},
  {title: 'Shallow', genre: 'Rock', id: '3', artistId: '3'}
];

var artists = [
  {name: 'Ariana Grande', grammys: 4, id: '1'},
  {name: 'Halsey', grammys: 2, id: '2'},
  {name: 'Lady Gaga and Bradley Cooper', grammys: 0, id: '3'}
];

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
  })
  // Needs to be a function for associations, to make sure everything is loaded
  // It returns an Object, avoids reference errors
});
// A function that takes in an object

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
});

// What we can access in the graph, how we initially jump in
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
      	// goes out and returns what we ask for
        // code to get data from the db
        // the actual Mongoose query
        return _.find(songs, { id: args.id });
        // when we receive the request we'll find the song in the songs Array using lodash
      }
    },
    artist: {
      type: ArtistType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return _.find(artists, { id: args.id });
      }
    },
    songs: {
      type: new GraphQLList(SongType),
      resolve(parent, args) {
        return songs;
      }
    },
    artists: {
      type: new GraphQLList(ArtistType),
      resolve(parent, args) {
        return artists;
      }
    }        
  }  
});

module.exports = new GraphQLSchema({
  query: RootQuery
});