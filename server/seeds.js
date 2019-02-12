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

const songs = [
  {title: '7 Ringsx', genre: 'Pop'},
  {title: 'Without Mex', genre: 'Pop'},
  {title: 'Shallowx', genre: 'Rock'}
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