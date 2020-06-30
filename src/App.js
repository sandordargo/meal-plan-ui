import React, {Component} from 'react';
import './App.css';
import ApiCalendar from 'react-google-calendar-api';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {BACKEND_URL} from "./constants";
import {getMonday, getWeekNumber, uuidv4, uniqueCopyOf} from "./utils";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import 'bootstrap/dist/css/bootstrap.min.css';


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

const getItemStyleWithIndex = (isDragging, draggableStyle, index) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: GRID_SIZE * 2,
    margin: `0 ${GRID_SIZE}px 0 0`,

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : index > 4 ? 'red' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
});

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

// const getListStyle = isDraggingOver => ({
//     background: isDraggingOver ? 'lightblue' : 'lightgrey',
//     display: 'flex',
//     padding: GRID_SIZE,
//     overflow: 'auto',
// });

class App extends Component {
    constructor(props){
        super(props);
        this.getAnohterVegetarian = this.getAnohterVegetarian.bind(this);
        this.getAnohterEasy = this.getAnohterEasy.bind(this);
        this.getAnohterOther = this.getAnohterOther.bind(this);
        this.addToCalendar = this.addToCalendar.bind(this);
        this.updateDatabaseWithDate = this.updateDatabaseWithDate.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.getDragList = this.getDragList.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.nextWeek = this.nextWeek.bind(this);
        this.previousWeek = this.previousWeek.bind(this);
        this.alreadyInPlan = this.alreadyInPlan.bind(this);
        this.updateItems = this.updateItems.bind(this);
        this.getCategoriesSuggestions = this.getCategoriesSuggestions.bind(this);
        this.handleCheckbox = this.handleCheckbox.bind(this);
        this.retrieveRecipes = this.retrieveRecipes.bind(this);
        this.lastPrepared = this.lastPrepared.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.delete = this.delete.bind(this);

        this.state = {
            list: [],
            vegetarianRecipe: [],
            easyRecipe: [],
            otherRecipe: [],
            latestRecipes: [],
            isLoading: 5,
            items: [],
            weekStart: getMonday(new Date()),
            suggestions:{},
            listedRecipes:[]
        };
        if (typeof this.props.location !== 'undefined' && typeof this.props.location.state !== 'undefined' && typeof this.props.location.state.recipe !== 'undefined') {

            fetch(BACKEND_URL + '/api/recipes/latest?limit=1')
                .then(res => res.json())
                .then(data => {
                    this.setState({
                        ...this.state,
                        latestRecipes: data['recipes'].map(r => uniqueCopyOf(r)),
                    })
                });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("did update");
        console.log(prevProps);
        console.log(prevState);
        if (typeof this.props.location.state !== 'undefined') {
            console.log("lolo");
            console.log(this.props.location.state.refresh);
            // this.setState({
            //     ...this.state,
            //     latestRecipes:this.state.latestRecipes.concat(this.props.location.state.recipe),
            // });
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
        fetch(BACKEND_URL + '/api/recipes/latest?limit=10')
            .then(res => res.json())
            .then(data => {
                this.setState({
                    ...this.state,
                    latestRecipes: data['recipes'].map(r => uniqueCopyOf(r)),
                    isLoading: this.state.isLoading -1,
                    })
            });
        this.getCategoriesSuggestions();
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
                    vegetarianRecipe: Array.of(data['recipes'][0]),
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
                    easyRecipe: Array.of(data['recipes'][0]),
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
                    console.log("WE ALREADY HAVE THIS ");
                    this.getAnohterOther();
                    return;
                }

                const otherId = this.state.otherRecipe[0]['_id'];
                this.setState({
                    ...this.state,
                    otherRecipe: Array.of(data['recipes'][0]),
                    items: this.updateItems(otherId, data['recipes'][0], 2)
                });
            });
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
        const period = recipe.period ? parseInt(recipe.period, 10) : 60;
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
        latestRecipes: 'latestRecipes',
        listedRecipes: 'listedRecipes',
    };

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

            let state = { ...this.state };

            if (source.droppableId === 'mealPlan') {
                state = { items: items };
            }
            if (source.droppableId === 'latestRecipes') {
                state = { latestRecipes: items };
            }
            if (source.droppableId === 'listedRecipes') {
                state = { listedRecipes: items };
            }

            this.setState(state);
        } else {
            const result = move(
                this.getDragList(source.droppableId),
                this.getDragList(destination.droppableId),
                source,
                destination
            );

            let state = { ...this.state };

            if (source.droppableId === 'mealPlan' || destination.droppableId === 'mealPlan') {
                state = { ...state, items: result.mealPlan };
            }
            if (source.droppableId === 'latestRecipes' || destination.droppableId === 'latestRecipes') {
                state = { ...state, latestRecipes: result.latestRecipes };
            }
            if (source.droppableId === 'listedRecipes' || destination.droppableId === 'listedRecipes') {
                state = { ...state, listedRecipes: result.listedRecipes};
            }

            this.setState(state);
        }
    }

    getCategoriesSuggestions() {
        fetch(BACKEND_URL + '/api/categories')
            .then(res => res.json())
            .then(data => {
                this.setState({
                    ...this.state,
                    isLoading: this.state.isLoading -1,
                    suggestions: data['recipes'].reduce(function(map, recipe){ map[recipe] = false; return map}, {})
                })
            });

    }


  render() {
      if (this.state.isLoading > 0) {
          return null;
      }
    console.log(this.state.suggestions);
    console.log(this.state.suggestions['csirke']);

      return (
          <div className="App">
              <div className="App-header">
                  <h2>Meal planner</h2>
              </div>
              <Container fluid="md" >


              <Row className="justify-content-md-center title" >
                  <Col md="auto">
                      <Row>
                          <button onClick={this.previousWeek}>&lt;&lt;</button>
                      </Row>
                  </Col>
              <Col md="auto">
                      <Row>
                          <h2>Your meal plan for W{getWeekNumber(this.state.weekStart)}</h2>
                      </Row>
              </Col>
                  <Col md="auto">
                      <Row>
                          <button onClick={this.nextWeek}>
                              &gt;&gt;
                          </button>
                      </Row>

                  </Col>

              </Row>

              <DragDropContext onDragEnd={this.onDragEnd}>
                  <Row className="justify-content-md-center" >

                  <Droppable droppableId="mealPlan" direction="horizontal">
                      {(provided, snapshot) => (
                          <table ref={provided.innerRef}
                                 >
                              <thead>
                              <tr className="latestTable">
                                  <th className="difficultyColumn">Monday</th>
                                  <th className="difficultyColumn">Tuesday</th>
                                  <th className="difficultyColumn">Wednesday</th>
                                  <th className="difficultyColumn">Thursday</th>
                                  <th className="difficultyColumn">Friday</th>
                              </tr>
                              </thead>
                              <tbody>
                              <tr>
                                  {this.state.items.map((item, index) => (
                                      <Draggable key={item.ids} draggableId={item.ids} index={index}>
                                          {(provided, snapshot) => (
                                              <td
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  style={getItemStyleWithIndex(
                                                      snapshot.isDragging,
                                                      provided.draggableProps.style,
                                                      index
                                                  )}
                                              >
                                                  {item.name}
                                                  <button onClick={() => this.removeItem(index)}>
                                                      Remove
                                                  </button>
                                              </td>
                                          )}
                                      </Draggable>
                                  ))}
                                  {provided.placeholder}
                              </tr>
                              </tbody>

                          </table>
                      )}
                  </Droppable>

                  </Row>

                  <Row className="justify-content-md-center" >
                      <Col md="auto">
                          <button onClick={this.getAnohterVegetarian}>
                              Get Another Veggie
                          </button>
                      </Col>
                      <Col md="auto">
                          <button onClick={this.getAnohterEasy}>
                              Get Another Easy
                          </button>
                      </Col>
                      <Col md="auto">
                          <button onClick={this.getAnohterOther}>
                              Get Another
                          </button>
                      </Col>
                      <Col md="auto">
                          <button onClick={(e) => this.addToCalendar()}>
                              Add To Calendar
                          </button>
                      </Col>
                  </Row>


                  <Row className="justify-content-md-center title" >
                      <h2>Your latest recipes</h2>
                  </Row>

                  <Row className="justify-content-md-center" >
                      <Col sm={2}>
                      </Col>
                      <Col sm={10}>
                          <Droppable droppableId="latestRecipes" direction="vertical">
                              {(provided, snapshot) => (
                                  <table className="latestTable"
                                  >
                                      <thead>
                                      <tr>
                                          <th className="nameColumn">
                                              Name
                                          </th>
                                          <th className="categoriesColumn">
                                              Categories
                                          </th>
                                          <th className="difficultyColumn">
                                              Difficulty
                                          </th>
                                          <th className="lastPreparedColumn">
                                              Last prepared
                                          </th>
                                      </tr>
                                      </thead>


                                      <tbody ref={provided.innerRef}
                                      >

                                      {this.state.latestRecipes.slice(0, 5).map((recipe, index) => (

                                          <Draggable
                                              key={recipe['_id']+"l"}
                                              draggableId={recipe['_id']+"l"}
                                              index={index}>
                                              {(provided, snapshot) => (
                                                  <tr
                                                      // onClick={() => this.handlePageChange(recipe)}
                                                      ref={provided.innerRef}
                                                      {...provided.draggableProps}
                                                      {...provided.dragHandleProps}
                                                      style={getItemStyle(
                                                          snapshot.isDragging,
                                                          provided.draggableProps.style
                                                      )}>
                                                      <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}><a href={recipe['url']} target="_blank">{recipe['name']}</a></td>
                                                      <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}>{recipe['categories'].join(" ")}</td>
                                                      <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}>{recipe['difficulty']}</td>
                                                      <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}>{this.lastPrepared(recipe['next_earliest'],recipe['period'])}</td>
                                                      <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}><button onClick={(e) => this.handlePageChange(recipe)}>
                                                          E
                                                      </button></td>
                                                      <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}><button onClick={(e) => this.delete(recipe)}>
                                                          D
                                                      </button></td>

                                                  </tr>
                                              )}
                                          </Draggable>
                                      ))}
                                      {provided.placeholder}
                                      </tbody>


                                  </table>
                              )}
                          </Droppable>
                      </Col>
                  </Row>

                   <Row className="justify-content-md-center title" >
                      <h2>A selection of your recipes</h2>
                  </Row>

                  <Row className="justify-content-md-center" >

                  <Col sm={2}>

                          {Object.keys(this.state.suggestions).map((k, i) => (
                              <div>
                              <label>{k}</label>
                              <input type="checkbox" defaultChecked={this.state.suggestions[k]} name={k} onChange={(event) => this.handleCheckbox(k, event)}/>
                              </div>
                              )
                              // <p> {k} : {this.state.suggestions[k].toString()}</p>)
                          )}

                      <button
                          onClick={(e) => this.retrieveRecipes()}
                      >
                          Retrieve recipes
                      </button>
                  </Col>
                  <Col sm={10}>
                  <Droppable droppableId="listedRecipes" direction="vertical">
                      {(provided, snapshot) => (
                      <table className="selectionTable">
                      <thead>
                      <tr>
                          <th className="nameColumn">
                              Name
                          </th>
                          <th className="categoriesColumn">
                              Categories
                          </th>
                          <th className="difficultyColumn">
                              Difficulty
                          </th>
                          <th className="lastPreparedColumn">
                              Last prepared
                          </th>
                      </tr>
                      </thead>


                        <tbody ref={provided.innerRef}
                                  >

                          {this.state.listedRecipes.map((recipe, index) => (

                              <Draggable
                                  key={recipe['_id']}
                                  draggableId={recipe['_id']}
                                  index={index}>
                                  {(provided, snapshot) => (

                                      <tr
                                          // onClick={() => this.handlePageChange(recipe)}
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getItemStyle(
                                              snapshot.isDragging,
                                              provided.draggableProps.style
                                          )}>
                                          <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}><a href={recipe['url']} target="_blank">{recipe['name']}</a></td>
                                          <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}>{recipe['categories'].join(" ")}</td>
                                          <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}>{recipe['difficulty']}</td>
                                          <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}>{this.lastPrepared(recipe['next_earliest'],recipe['period'])}</td>
                                          <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}><button onClick={(e) => this.handlePageChange(recipe)}>
                                              E
                                          </button></td>
                                          <td className={((index % 2 === 0)) ? "Even-Row" : "Other-Row"}><button onClick={(e) => this.delete(recipe)}>
                                              D
                                          </button></td>


                                      </tr>
                                  )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                        </tbody>


                  </table>
                      )}
                  </Droppable>
                          </Col>
                  </Row>

          </DragDropContext>
          </Container>

          </div>
      );
      // <!-- make this drap droppable-->
      //<!-- make this editable-->

  }

    handlePageChange(recipe) {
        this.props.history.push({
            pathname: '/editRecipe',
            state: {
                recipe: recipe
            }
        });
        // console.log('redirect');
        // return <Redirect to='/newrecipe'/>;
    }


    lastPrepared(nextEarliest, period) {
        period = parseInt(period, 10);
        if (period && nextEarliest) {
            let date = new Date(nextEarliest);
            date.setDate(date.getDate() - period); // Set now + 30 days as the new date
            return  date.toISOString().split('T')[0];
        }
        return "N/A";
    }

    handleCheckbox(key, event) {
        console.log(key);
        console.log(event.target.value);
        let ns = {...this.state.suggestions};
        ns[key] = !ns[key];
        this.setState({
            ...this.state,
            suggestions:ns
        })

    }

    retrieveRecipes() {
        let categoriesStr  = "?categories=";
        let any = false;
        Object.keys(this.state.suggestions).forEach((k, i) => {
            if (this.state.suggestions[k] === true) {
                if (any === true) {
                    categoriesStr +=',';
                }
                categoriesStr += k;
                any = true;

            }
        });
        if (!any) {
            categoriesStr = "";
        }


        fetch(BACKEND_URL + '/api/anyrecipe' + categoriesStr)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                this.setState({
                    ...this.state,
                    listedRecipes: data['recipes']
                });
             });
            
    }

    delete(recipe) {
        fetch(BACKEND_URL + '/api/recipes/delete', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recipe)
        }).then(res => {
            console.log(res);
            const index = this.state.listedRecipes.indexOf(recipe);
            if (index !== -1) { this.state.listedRecipes.splice(index, 1); }
            const latestRecipesIndex = this.state.latestRecipes.indexOf(recipe);
            if (latestRecipesIndex !== -1) { this.state.latestRecipes.splice(latestRecipesIndex, 1); }
            this.setState({ state: this.state });
        });
    }
}


export default App;
