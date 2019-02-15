import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import { getArtistsQuery, addSongMutation, getSongsQuery } from './queries';

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
    console.log(this.props)
    let data = this.props.getArtistsQuery;

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

    const { title, genre, artistId } = this.state

    this.props.addSongMutation({
      variables: { title, genre, artistId },
      refetchQueries: [{ query: getSongsQuery }]
    })
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

export default compose(
  graphql(getArtistsQuery, { name: "getArtistsQuery" }),
  graphql(addSongMutation, { name: "addSongMutation" })
)(AddSong);