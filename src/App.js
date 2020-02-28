import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ApiCalendar from 'react-google-calendar-api';

const BE_URL = "https://meal-planner-be.herokuapp.com";

// https://developers.google.com/calendar/v3/reference/events/insert
class App extends Component {
    constructor(props){
        super(props);
        this.getAnohterVegetarian = this.getAnohterVegetarian.bind(this);
        this.getAnohterEasy = this.getAnohterEasy.bind(this);
        this.getAnohterOther = this.getAnohterOther.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.addToCalendar = this.addToCalendar.bind(this);
        this.updateDatabaseWithDate = this.updateDatabaseWithDate.bind(this);

        this.state = {
            list: [],
            vegetarianRecipe: [],
            easyRecipe: [],
            otherRecipe: [],
            latestRecipes: [],
            isLoading: 4
    }
    }

    // Fetch the list on first mount
    componentDidMount() {
        this.getList();
    }

    // Retrieves the list of items from the Express app
    getList = () => {
        // 1 vega
        fetch(BE_URL + '/api/recipes/random?categories=vega')
            .then(res => res.json())
            .then(data => this.setState({ vegetarianRecipe:this.state.vegetarianRecipe.concat(data['recipes'][0]), easyRecipe:this.state.easyRecipe, otherRecipe:this.state.otherRecipe, latestRecipes:this.state.latestRecipes, isLoading: this.state.isLoading -1}));
        // 1 easy
        fetch(BE_URL + '/api/recipes/random?difficulty=easy')
            .then(res => res.json())
            .then(data => this.setState({ vegetarianRecipe:this.state.vegetarianRecipe, easyRecipe:this.state.easyRecipe.concat(data['recipes'][0]), otherRecipe:this.state.otherRecipe, latestRecipes:this.state.latestRecipes, isLoading: this.state.isLoading -1 }));
        // 1 random
        fetch(BE_URL + '/api/recipes/random')
            .then(res => res.json())
            .then(data => this.setState({ vegetarianRecipe:this.state.vegetarianRecipe, easyRecipe:this.state.easyRecipe, otherRecipe:this.state.otherRecipe.concat(data['recipes'][0]), latestRecipes:this.state.latestRecipes, isLoading: this.state.isLoading -1 }));
        fetch(BE_URL + '/api/recipes/latest')
            .then(res => res.json())
            .then(data => this.setState({ vegetarianRecipe:this.state.vegetarianRecipe, easyRecipe:this.state.easyRecipe, otherRecipe:this.state.otherRecipe, latestRecipes:this.state.latestRecipes.concat(data['recipes']), isLoading: this.state.isLoading -1 }));
    };

     getAnohterVegetarian() {
        fetch(BE_URL + '/api/recsipes/random?categories=vega')
            .then(res => res.json())
            .then(data => this.setState({ vegetarianRecipe:this.state.vegetarianRecipe = Array.of(data['recipes'][0]), easyRecipe:this.state.easyRecipe, otherRecipe:this.state.otherRecipe, isLoading: this.state.isLoading}));
    }

    getAnohterEasy() {
        fetch(BE_URL + '/api/recipes/random?difficulty=easy')
            .then(res => res.json())
            .then(data => this.setState({ vegetarianRecipe:this.state.vegetarianRecipe, easyRecipe:this.state.easyRecipe = Array.of(data['recipes'][0]), otherRecipe:this.state.otherRecipe, isLoading: this.state.isLoading -1 }));
    }

    getAnohterOther() {
        fetch(BE_URL + '/api/recipes/random')
            .then(res => res.json())
            .then(data => this.setState({ vegetarianRecipe:this.state.vegetarianRecipe, easyRecipe:this.state.easyRecipe, otherRecipe:this.state.otherRecipe = Array.of(data['recipes'][0]), isLoading: this.state.isLoading -1 }));
    }

    handleItemClick(event: SyntheticEvent<any>, name: string): void {
        if (name === 'sign-in') {
            ApiCalendar.handleAuthClick();
        } else if (name === 'sign-out') {
            ApiCalendar.handleSignoutClick();
        }
    }

    makeEvent(startDate, numberOfDays, recipe) {
         const startDateStr = startDate.toISOString().split('T')[0];
         let endDate = startDate;
         endDate.setDate(startDate.getDate() + numberOfDays);
         const endDateStr = endDate.toISOString().split('T')[0];


        return {
            'summary': recipe.name,
            'start': {
                'date': startDateStr
            },
            'end': {
                'date': endDateStr,
            }
        };

    }

    updateDatabaseWithDate(startDate, numberOfDays, recipe) {
        const period = recipe.period ? recipe.period : 60;
        let date = new Date(startDate);
        date.setDate(date.getDate() + period); // Set now + 30 days as the new date
        const nextDateStr =  date.toISOString().split('T')[0];
        fetch(BE_URL + '/api/recipes/update_next', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: recipe.name,
                next_earliest: nextDateStr
            })
        }).then(res => console.log(res));
    }

    createEventInCalendar(startDate, numberOfDays, recipe) {
        ApiCalendar.createEvent(this.makeEvent(startDate, numberOfDays,  recipe))
            .then((result: object) => {
                console.log(result);
                this.updateDatabaseWithDate(startDate, numberOfDays, recipe);

            })
            .catch((error: any) => {
                console.log(error);
            });
    }

    addToCalendar() {
        var nextMonday = new Date();
        nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
        this.createEventInCalendar(nextMonday, 2,  this.state.otherRecipe[0]);

        var nextWednedsay = new Date();
        nextWednedsay.setDate(nextWednedsay.getDate() + (3 + 7 - nextWednedsay.getDay()) % 7);
        this.createEventInCalendar(nextWednedsay, 2,  this.state.vegetarianRecipe[0]);

        var nextFiday = new Date();
        nextFiday.setDate(nextFiday.getDate() + (5 + 7 - nextFiday.getDay()) % 7);
        this.createEventInCalendar(nextFiday, 1,  this.state.easyRecipe[0]);
    }

  render() {

      const { list, vegetarianRecipe, easyRecipe, otherRecipe, latestRecipes, isLoading } = this.state;

      console.log("list");
      console.log(vegetarianRecipe);
      if (isLoading > 0) {
          console.log('still loading')
          return null;
      }

      console.log(list.length);
      return (

      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
              <div>
                  Vegetarian
                  {vegetarianRecipe.map((item) => {
                      return(
                          <div>
                              {item.name} : {item.categories}
                          </div>
                      );
                  })}

                  <button onClick={this.getAnohterVegetarian}>
                      Get Another
                  </button>
                  <p></p>
                  Easy
                  {easyRecipe.map((item) => {
                      return(
                          <div>
                              {item.name} : {item.categories}
                          </div>
                      );
                  })}
                  <button onClick={this.getAnohterEasy}>
                      Get Another
                  </button>
                  <p></p>

                  Other
                  {otherRecipe.map((item) => {
                      return(
                          <div>
                              {item.name} : {item.categories}
                          </div>
                      );
                  })}
                  <button onClick={this.getAnohterOther}>
                      Get Another
                  </button>
                  <p></p>
                  <button
                      onClick={(e) => this.handleItemClick(e, 'sign-in')}
                  >
                      sign-in
                  </button>
                  <button
                      onClick={(e) => this.handleItemClick(e, 'sign-out')}
                  >
                      sign-out
                  </button>
                  <button
                      onClick={(e) => this.addToCalendar()}
                  >
                      Add To Calendar
                  </button>
                  <p></p>
                  Latest Recipes
                  {latestRecipes.map((item) => {
                      return(
                          <div>
                              {item.name} : {item.categories}
                          </div>
                      );
                  })}
              </div>
      </div>
    );
  }
}

export default App;
