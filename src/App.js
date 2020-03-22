import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ApiCalendar from 'react-google-calendar-api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';



const BE_URL = "https://meal-planner-be.herokuapp.com";
// a little function to help us with reordering the result

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
}

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

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
    // const [removed] = sourceClone.splice(droppableSource.index, 1);
    let removed = {...sourceClone[droppableSource.index]};
    removed["ids"] = uuidv4();


    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 ${grid}px 0 0`,

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    display: 'flex',
    padding: grid,
    overflow: 'auto',
});
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
        this.onDragEnd = this.onDragEnd.bind(this);
        this.getDragList = this.getDragList.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.nextWeek = this.nextWeek.bind(this);
        this.previousWeek = this.previousWeek.bind(this);

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

    // Fetch the list on first mount
    componentDidMount() {
        this.getList();
    }

    // Retrieves the list of items from the Express app
    getList = () => {
        // 1 vega
        fetch(BE_URL + '/api/recipes/random?categories=vega')
            .then(res => res.json())
            .then(data => {
                let rec1 = {...data['recipes'][0]};
                rec1['id'] = 1;
                rec1['ids'] = rec1['_id'] + "A";
                let rec2 = {...data['recipes'][0]};
                rec2['id'] = 2;
                rec2['ids'] = rec2['_id'] + "B";
                this.setState({ vegetarianRecipe:this.state.vegetarianRecipe.concat(data['recipes'][0]), easyRecipe:this.state.easyRecipe, otherRecipe:this.state.otherRecipe, latestRecipes:this.state.latestRecipes, isLoading: this.state.isLoading -1, items: this.state.items.concat(rec2).concat(rec1)});
            });
        // 1 easy
        fetch(BE_URL + '/api/recipes/random?difficulty=easy')
            .then(res => res.json())
            .then(data => {
                let rec1 = {...data['recipes'][0]};
                rec1['id'] = 3;
                rec1['ids'] = rec1['_id'] + "A";
                this.setState({ vegetarianRecipe:this.state.vegetarianRecipe, easyRecipe:this.state.easyRecipe.concat(rec1), otherRecipe:this.state.otherRecipe, latestRecipes:this.state.latestRecipes, isLoading: this.state.isLoading -1, items: this.state.items.concat(rec1) })
            });
        // 1 random
        fetch(BE_URL + '/api/recipes/random')
            .then(res => res.json())
            .then(data => {
                let rec1 = {...data['recipes'][0]};
                rec1['id'] = 4;
                rec1['ids'] = rec1['_id'] + "A";

                let rec2 = {...data['recipes'][0]};
                rec2['id'] = 5;
                rec2['ids'] = rec2['_id'] + "B";

                this.setState({
                    vegetarianRecipe: this.state.vegetarianRecipe,
                    easyRecipe: this.state.easyRecipe,
                    otherRecipe: this.state.otherRecipe.concat(data['recipes'][0]),
                    latestRecipes: this.state.latestRecipes,
                    isLoading: this.state.isLoading - 1,
                    items: this.state.items.concat(rec1).concat(rec2) // TODO item should always be a copy of the others, deep copy...
                })
            });
        fetch(BE_URL + '/api/recipes/latest')
            .then(res => res.json())
            .then(data => {
                let rec1 = {...data['recipes'][0]};
                rec1['ids'] = rec1['_id'] + "A";
                let rec2 = {...data['recipes'][1]};
                rec2['ids'] = rec2['_id'] + "B";
                let rec3 = {...data['recipes'][2]};
                rec3['ids'] = rec3['_id'] + "C";
                let rec4 = {...data['recipes'][3]};
                rec4['ids'] = rec4['_id'] + "D";
                let rec5 = {...data['recipes'][4]};
                rec5['ids'] = rec5['_id'] + "E";

                this.setState({ vegetarianRecipe:this.state.vegetarianRecipe, easyRecipe:this.state.easyRecipe, otherRecipe:this.state.otherRecipe, latestRecipes:this.state.latestRecipes.concat(rec1).concat(rec2).concat(rec3).concat(rec4).concat(rec5), isLoading: this.state.isLoading -1, items: this.state.items })
            });
    };

     getAnohterVegetarian() {
        fetch(BE_URL + '/api/recipes/random?categories=vega')
            .then(res => res.json())
            .then(data => {
                let oldItems = this.state.items;
                const otherId = this.state.otherRecipe[0]['_id'];
                const easyId = this.state.easyRecipe[0]['_id'];
                const veggieId = this.state.vegetarianRecipe[0]['_id'];
                const newId = data['recipes'][0]['_id'];
                if (newId === otherId || newId === easyId) {
                    console.log("WE ALREADY HAVE THIS ")
                    this.getAnohterVegetarian();
                    return;
                }


                console.log(oldItems);
                oldItems = oldItems.filter(function(obj){
                   return obj['_id'] !== veggieId;
                });
                console.log(oldItems);

                let rec1 = {...data['recipes'][0]};
                rec1['id'] = 1;
                rec1['ids'] = rec1['_id'] + "A";

                let rec2 = {...data['recipes'][0]};
                rec2['id'] = 2;
                rec2['ids'] = rec2['_id'] + "B";
                const newItems = oldItems.concat(rec1).concat(rec2);


                this.setState({
                    vegetarianRecipe: this.state.vegetarianRecipe = Array.of(data['recipes'][0]),
                    easyRecipe: this.state.easyRecipe,
                    otherRecipe: this.state.otherRecipe,
                    latestRecipes: this.state.latestRecipes,
                    isLoading: this.state.isLoading,
                    items: newItems
                });
            });
    }

    getAnohterEasy() {
        fetch(BE_URL + '/api/recipes/random?difficulty=easy')
            .then(res => res.json())
            .then(data => {
                let oldItems = this.state.items;
                const otherId = this.state.otherRecipe[0]['_id'];
                const easyId = this.state.easyRecipe[0]['_id'];
                const veggieId = this.state.vegetarianRecipe[0]['_id'];
                const newId = data['recipes'][0]['_id'];
                if (newId === otherId || newId === veggieId) {
                    console.log("WE ALREADY HAVE THIS ")
                    this.getAnohterEasy();
                    return;
                }
                console.log(oldItems);
                oldItems = oldItems.filter(function(obj){
                    return obj['_id'] !== easyId;
                });
                console.log(oldItems);
                let rec1 = {...data['recipes'][0]};
                rec1['id'] = 3;
                rec1['ids'] = rec1['_id'] + "A";
                const newItems = oldItems.concat(rec1);
                console.log(rec1);
                console.log(oldItems);
                console.log(newItems);
                this.setState({
                    vegetarianRecipe: this.state.vegetarianRecipe,
                    easyRecipe: this.state.easyRecipe = Array.of(data['recipes'][0]),
                    otherRecipe: this.state.otherRecipe,
                    latestRecipes: this.state.latestRecipes,
                    isLoading: this.state.isLoading - 1,
                    items: newItems
                });
            });
    }

    getAnohterOther() {
        fetch(BE_URL + '/api/recipes/random')
            .then(res => res.json())
            .then(data => {
                let oldItems = this.state.items;
                const otherId = this.state.otherRecipe[0]['_id'];
                const easyId = this.state.easyRecipe[0]['_id'];
                const veggieId = this.state.vegetarianRecipe[0]['_id'];
                const newId = data['recipes'][0]['_id'];
                if (newId === easyId || newId === veggieId) {
                    console.log("WE ALREADY HAVE THIS ")
                    this.getAnohterOther();
                    return;
                }

                oldItems = oldItems.filter(function(obj){
                    return obj['_id'] !== otherId;
                });
                let rec1 = {...data['recipes'][0]};
                rec1['id'] = 4;
                rec1['ids'] = rec1['_id'] + "A";

                let rec2 = {...data['recipes'][0]};
                rec2['id'] = 5;
                rec2['ids'] = rec2['_id'] + "B";
                const newItems = oldItems.concat(rec1).concat(rec2);

                this.setState({
                    vegetarianRecipe: this.state.vegetarianRecipe,
                    easyRecipe: this.state.easyRecipe,
                    otherRecipe: this.state.otherRecipe = Array.of(data['recipes'][0]),
                    latestRecipes: this.state.latestRecipes,
                    isLoading: this.state.isLoading - 1,
                    items: newItems
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
        let newState = Object.assign({}, this.state);
        let date = new Date();
        date.setTime(newState.weekStart.getTime() + (7*24*60*60*1000));
        newState.weekStart = date
        console.log(this.state);
        console.log(newState);
        this.setState(newState);
    }

    previousWeek() {
        let newState = Object.assign({}, this.state);
        let date = new Date();
        date.setTime(newState.weekStart.getTime() - (7*24*60*60*1000));
        newState.weekStart = date
        console.log(this.state);
        console.log(newState);
        this.setState(newState);
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

        this.state.items.forEach((item, index) => {
            setTimeout(() =>{
                let day = new Date(this.state.weekStart);
                day.setTime(day.getTime() + (index*24*60*60*1000));
                console.log(index);
                console.log(day);
                this.createEventInCalendar(day, 1,  item);
            }, 250*(index));
        });
    }

    id2List = {
        droppable: 'items',
        droppable2: 'latestRecipes'
    };

    getDragList = id => this.state[this.id2List[id]];
    removeItem = (index) => {
        let splicedItems =this.state.items;
        splicedItems.splice(index, 1)
        console.log(splicedItems);
        this.setState({
            vegetarianRecipe: this.state.vegetarianRecipe,
            easyRecipe: this.state.easyRecipe,
            otherRecipe: this.state.otherRecipe,
            latestRecipes: this.state.latestRecipes,
            isLoading: this.state.isLoading - 1,
            items: splicedItems
        })
    };

    onDragEnd(result) {
        // // dropped outside the list
        // if (!result.destination) {
        //     return;
        // }
        //
        // const items = reorder(
        //     this.state.items,
        //     result.source.index,
        //     result.destination.index
        // );
        //
        // this.setState({
        //     items,
        // });
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

            if (source.droppableId === 'droppable2') {
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
                items: result.droppable,
                latestRecipes: result.droppable2
            });
        }
    }

  render() {

      const { list, vegetarianRecipe, easyRecipe, otherRecipe, latestRecipes, isLoading } = this.state;

      if (isLoading > 0) {
          return null;
      }

      console.log(this.state.items);
      let cw = "45";
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
              <Droppable droppableId="droppable" direction="horizontal">
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
                                          {/*<td style={{ width: "120px" }}>{item.content}</td>*/}
                                          {/*<td style={{ width: "120px" }}>{item.test}</td>*/}
                                      </td>

                                  )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                          </tr>
                          </tbody>
                          </thead>
                          </table>
                      // <div
                      //     ref={provided.innerRef}
                      //     style={getListStyle(snapshot.isDraggingOver)}
                      //     {...provided.droppableProps}
                      // >
                      //     {this.state.items.map((item, index) => (
                      //         <Draggable key={item.id} draggableId={item.id} index={index}>
                      //             {(provided, snapshot) => (
                      //                 <div
                      //                     ref={provided.innerRef}
                      //                     {...provided.draggableProps}
                      //                     {...provided.dragHandleProps}
                      //                     style={getItemStyle(
                      //                         snapshot.isDragging,
                      //                         provided.draggableProps.style
                      //                     )}
                      //                 >
                      //                     {item.content}
                      //                 </div>
                      //             )}
                      //         </Draggable>
                      //     ))}
                      //     {provided.placeholder}
                      // </div>
                  )}
              </Droppable>

              <Droppable droppableId="droppable2">
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
