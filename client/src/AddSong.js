import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { getArtistsQuery } from './queries';

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
    let data = this.props.data;

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
    console.log(this.state);
  }   

  render() {
    return (
      <form onSubmit={this.submitForm.bind(this)}>
        <div>
          <label>Song Title:</label>
          <input type="text" onChange={(e) => this.setState({name: e.target.value})}/>
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

export default graphql(getArtistsQuery)(AddSong);