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
    },
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
    },
    deleteSong: {
      type: SongType,
      args: {
        id: { type: GraphQLString }
      },
      resolve(parent, args){
        return SongMongooseModel.findByIdAndDelete(args.id);
      }
    },
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
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});