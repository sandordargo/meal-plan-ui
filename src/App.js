import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import ApiCalendar from 'react-google-calendar-api';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {BACKEND_URL} from "./constants";
import {getMonday, getWeekNumber, uuidv4, uniqueCopyOf} from "./utils";

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    console.log(sourceClone[droppableSource.index]);
    // use this if you want to remove item from source list
    // const [moved] = sourceClone.splice(droppableSource.index, 1);
    let moved = {...sourceClone[droppableSource.index]};
    moved["ids"] = uuidv4();
    destClone.splice(droppableDestination.index, 0, moved);
    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;
    return result;
};

const GRID_SIZE = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: GRID_SIZE * 2,
    margin: `0 ${GRID_SIZE}px 0 0`,

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    display: 'flex',
    padding: GRID_SIZE,
    overflow: 'auto',
});

class App extends Component {
    constructor(props){
        super(props);
        this.getAnohterVegetarian = this.getAnohterVegetarian.bind(this);
        this.getAnohterEasy = this.getAnohterEasy.bind(this);
        this.getAnohterOther = this.getAnohterOther.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.addToCalendar = this.addToCalendar.bind(this);
        this.updateDatabaseWithDate = this.updateDatabaseWithDate.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.getDragList = this.getDragList.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.nextWeek = this.nextWeek.bind(this);
        this.previousWeek = this.previousWeek.bind(this);
        this.alreadyInPlan = this.alreadyInPlan.bind(this);
        this.updateItems = this.updateItems.bind(this);

        this.state = {
            list: [],
            vegetarianRecipe: [],
            easyRecipe: [],
            otherRecipe: [],
            latestRecipes: [],
            isLoading: 4,
            items: [],
            weekStart: getMonday(new Date()),
        }
    }

    componentDidMount() {
        this.getList();
    }

    getList = () => {
        // 1 vega
        fetch(BACKEND_URL + '/api/recipes/random?categories=vega')
            .then(res => res.json())
            .then(data => {
                this.setState({
                    ...this.state,
                    vegetarianRecipe:this.state.vegetarianRecipe.concat(uniqueCopyOf(data['recipes'][0])),
                    isLoading: this.state.isLoading -1,
                    items: this.state.items.concat(uniqueCopyOf(data['recipes'][0])).concat(uniqueCopyOf(data['recipes'][0]))});
            });
        // 1 easy
        fetch(BACKEND_URL + '/api/recipes/random?difficulty=easy')
            .then(res => res.json())
            .then(data => {
                this.setState({
                    ...this.state,
                    easyRecipe:this.state.easyRecipe.concat(uniqueCopyOf(data['recipes'][0])),
                    isLoading: this.state.isLoading -1,
                    items: this.state.items.concat(uniqueCopyOf(data['recipes'][0])) })
            });
        // 1 random
        fetch(BACKEND_URL + '/api/recipes/random')
            .then(res => res.json())
            .then(data => {
                this.setState({
                    ...this.state,
                    otherRecipe: this.state.otherRecipe.concat(uniqueCopyOf(data['recipes'][0])),
                    isLoading: this.state.isLoading - 1,
                    items: this.state.items.concat(uniqueCopyOf(data['recipes'][0])).concat(uniqueCopyOf(data['recipes'][0]))
                })
            });
        fetch(BACKEND_URL + '/api/recipes/latest')
            .then(res => res.json())
            .then(data => {
                this.setState({
                    ...this.state,
                    latestRecipes:this.state.latestRecipes.concat(uniqueCopyOf(data['recipes'][0])).concat(uniqueCopyOf(data['recipes'][1])).concat(uniqueCopyOf(data['recipes'][2])).concat(uniqueCopyOf(data['recipes'][3])).concat(uniqueCopyOf(data['recipes'][4])),
                    isLoading: this.state.isLoading -1,
                    })
            });
    };


    alreadyInPlan(newId) {
        const otherId = this.state.otherRecipe[0]['_id'];
        const easyId = this.state.easyRecipe[0]['_id'];
        const veggieId = this.state.vegetarianRecipe[0]['_id'];
        return (newId === otherId || newId === easyId || newId === veggieId);
    }

    updateItems(oldId, newRecipe, numberOfDays) {
        let items = this.state.items;
        items = items.filter(function(obj){
            return obj['_id'] !== oldId;
        });
        for (let i = 0; i < numberOfDays; i++) {
            items = items.concat(uniqueCopyOf(newRecipe));
        }
        return items;
    }

     getAnohterVegetarian() {
        fetch(BACKEND_URL + '/api/recipes/random?categories=vega')
            .then(res => res.json())
            .then(data => {
                const newId = data['recipes'][0]['_id'];
                if (this.alreadyInPlan(newId)) {
                    console.log("WE ALREADY HAVE THIS ");
                    this.getAnohterVegetarian();
                    return;
                }

                const veggieId = this.state.vegetarianRecipe[0]['_id'];
                this.setState({
                    ...this.state,
                    vegetarianRecipe: this.state.vegetarianRecipe = Array.of(data['recipes'][0]),
                    items: this.updateItems(veggieId, data['recipes'][0], 2)
                });
            });
    }

    getAnohterEasy() {
        fetch(BACKEND_URL + '/api/recipes/random?difficulty=easy')
            .then(res => res.json())
            .then(data => {
                const newId = data['recipes'][0]['_id'];
                if (this.alreadyInPlan(newId)) {
                    console.log("WE ALREADY HAVE THIS ")
                    this.getAnohterEasy();
                    return;
                }

                const easyId = this.state.easyRecipe[0]['_id'];
                this.setState({
                    ...this.state,
                    easyRecipe: this.state.easyRecipe = Array.of(data['recipes'][0]),
                    items: this.updateItems(easyId, data['recipes'][0], 1)
                });
            });
    }

    getAnohterOther() {
        fetch(BACKEND_URL + '/api/recipes/random')
            .then(res => res.json())
            .then(data => {
                const newId = data['recipes'][0]['_id'];
                if (this.alreadyInPlan(newId)) {
                    console.log("WE ALREADY HAVE THIS ")
                    this.getAnohterOther();
                    return;
                }

                const otherId = this.state.otherRecipe[0]['_id'];
                this.setState({
                    ...this.state,
                    otherRecipe: this.state.otherRecipe = Array.of(data['recipes'][0]),
                    items: this.updateItems(otherId, data['recipes'][0], 2)
                });
            });
    }

    handleItemClick(event: SyntheticEvent<any>, name: string): void {
        if (name === 'sign-in') {
            ApiCalendar.handleAuthClick();
        } else if (name === 'sign-out') {
            ApiCalendar.handleSignoutClick();
        }
    }

    nextWeek() {
        let date = new Date();
        date.setTime(this.state.weekStart.getTime() + (7*24*60*60*1000));
        this.setState({
            ...this.state,
            weekStart: date,
        });
    }

    previousWeek() {
        let date = new Date();
        date.setTime(this.state.weekStart.getTime() - (7*24*60*60*1000));
        this.setState({
            ...this.state,
            weekStart: date,
        });
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
        fetch(BACKEND_URL + '/api/recipes/update_next', {
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
        // https://developers.google.com/calendar/v3/reference/events/insert
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
        this.state.items.forEach((item, index) => {
            setTimeout(() =>{
                let day = new Date(this.state.weekStart);
                day.setTime(day.getTime() + (index*24*60*60*1000));
                this.createEventInCalendar(day, 1,  item);
            }, 250*(index));
        });
    }

    id2List = {
        mealPlan: 'items',
        latestRecipes: 'latestRecipes'
    };
    state;

    getDragList = id => this.state[this.id2List[id]];
    removeItem = (index) => {
        let splicedItems =this.state.items;
        splicedItems.splice(index, 1);
        this.setState({
            ...this.state,
            items: splicedItems
        })
    };

    onDragEnd(result) {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                this.getDragList(source.droppableId),
                source.index,
                destination.index
            );

            let state = { items };

            if (source.droppableId === 'latestRecipes') {
                state = { latestRecipes: items };
            }

            this.setState(state);
        } else {
            const result = move(
                this.getDragList(source.droppableId),
                this.getDragList(destination.droppableId),
                source,
                destination
            );

            this.setState({
                items: result.mealPlan,
                latestRecipes: result.latestRecipes
            });
        }
    }

  render() {
      if (this.state.isLoading > 0) {
          return null;
      }

      return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>

          <button
              onClick={this.previousWeek}
          >
              Previous
          </button>
          W{getWeekNumber(this.state.weekStart)}

          <button
              onClick={this.nextWeek}
          >
              Next
          </button>

          <DragDropContext onDragEnd={this.onDragEnd}>
              <Droppable droppableId="mealPlan" direction="horizontal">
                  {(provided, snapshot) => (
                      <table  ref={provided.innerRef}
                          style={getListStyle(snapshot.isDraggingOver)}>
                          <thead>
                          <tr>
                              <th>Monday</th>
                              <th>Tuesday</th>
                              <th>Wednesday</th>
                              <th>Thursday</th>
                              <th>Friday</th>
                          </tr>
                          <tbody>
                          <tr>
                          {this.state.items.map((item, index) => (
                              <Draggable key={item.ids} draggableId={item.ids} index={index}>
                                  {(provided, snapshot) => (
                                      <td
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getItemStyle(
                                              snapshot.isDragging,
                                              provided.draggableProps.style
                                          )}
                                      >
                                          {item.name}
                                          <button onClick = {() => this.removeItem(index)}>
                                              Remove
                                          </button>
                                      </td>
                                  )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                          </tr>
                          </tbody>
                          </thead>
                          </table>
                  )}
              </Droppable>

              <Droppable droppableId="latestRecipes">
                  {(provided, snapshot) => (
                      <div
                          ref={provided.innerRef}
                          style={getListStyle(snapshot.isDraggingOver)}>
                          {this.state.latestRecipes.map((item, index) => (
                              <Draggable
                                  key={item.ids}
                                  draggableId={item.ids}
                                  index={index}>
                                  {(provided, snapshot) => (
                                      <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getItemStyle(
                                              snapshot.isDragging,
                                              provided.draggableProps.style
                                          )}>
                                          {item.name} : {item.categories}
                                      </div>
                                  )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                      </div>
                  )}
              </Droppable>
          </DragDropContext>


              <div>
                  <button onClick={this.getAnohterVegetarian}>
                      Get Another Veggie
                  </button>
                  <p></p>
                  <button onClick={this.getAnohterEasy}>
                      Get Another Easy
                  </button>
                  <p></p>
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
              </div>
      </div>
    );
  }
}

export default App;
