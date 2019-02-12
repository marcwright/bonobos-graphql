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