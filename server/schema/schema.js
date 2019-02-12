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