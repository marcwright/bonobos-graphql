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