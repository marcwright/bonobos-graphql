import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { getSongsQuery } from './queries';

class SongList extends Component {
  displaySongs() {
    let data = this.props.data;

    if (data.loading) {
      return( <div>Loading songs...</div>);
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

// bind this query to this component
// the data willbe stored in the component's props
export default graphql(getSongsQuery)(SongList);