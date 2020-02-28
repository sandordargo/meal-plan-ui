import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import RecipeForm from "./RecipeForm";
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'


const routing = (
    <Router>
        <div>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/newrecipe">Add new recipe</Link>
                </li>
            </ul>
            <Route exact path="/" component={App} />
            <Route path="/newrecipe" component={RecipeForm} />
        </div>
    </Router>
)
ReactDOM.render(routing, document.getElementById('root'))

// https://codeburst.io/getting-started-with-react-router-5c978f70df91