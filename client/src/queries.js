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

const addSongMutation = gql`
  mutation($title: String!, $genre: String!, $artistId: ID!){
    addSong(title: $title, genre: $genre, artistId: $artistId){
      title
      id
    }
  }
`

export { getArtistsQuery, getSongsQuery, addSongMutation }; 