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