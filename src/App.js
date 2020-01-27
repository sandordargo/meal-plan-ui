import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            list: [],
            isLoading: true
    }
    }

    // Fetch the list on first mount
    componentDidMount() {
        this.getList();
    }

    // Retrieves the list of items from the Express app
    getList = () => {
        fetch('/api/recipes/random')
            .then(res => res.json())
            .then(data => this.setState({ list:data, isLoading: false }))
    };

  render() {

      const { list, isLoading } = this.state;

      console.log("list");
      console.log(list);
      if (isLoading) {
          console.log('still loading')
          return null;
      }

      console.log(list.recipes.length);
      return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
          {list.recipes.length ? (
              <div>
                  {/* Render the list of items */}
                  {list.recipes.map((item) => {
                      return(
                          <div>
                              {item.name}
                          </div>
                      );
                  })}
              </div>
          ) : (
              <div>
                  <h2>No List Items Found...</h2>
              </div>
          )
          }
      </div>
    );
  }
}

export default App;
