import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

// construct the query
const getSongsQuery = gql`
  {
    songs{
      title
      id
    }    
  }
`

class SongList extends Component {
  render() {
  
  	console.log(this.props)
  	
    return (
      <div>
        <ul>
          <li>Song List</li>
        </ul>      
      </div>
    );
  }
}

// bind this query to this component
// the data willbe stored in the component's props
export default graphql(getSongsQuery)(SongList);