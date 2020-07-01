import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import RecipeForm from "./RecipeForm";
import { Route, BrowserRouter as Router } from 'react-router-dom'
import {GoogleLogin, GoogleLogout} from 'react-google-login';
import { Navbar, NavLink } from 'react-bootstrap';
const logout = () => {
    console.log('logout') // eslint-disable-line

};

const success = response => {
    console.log(response); // eslint-disable-line
    console.log('that');
};

const error = response => {
    console.error("cant log in") // eslint-disable-line
    console.error(response) // eslint-disable-line
};
let clientImage = "";




const Login = () => {
    const [loggedIn, toggleShow] = useState(false);
    console.log('li' );

    console.log(loggedIn);
    if (! loggedIn) {
        console.log("show loging");
        return (

            <GoogleLogin
                onSuccess={res => {
                    clientImage = res.profileObj.imageUrl;
                    success(res);
                    toggleShow(true);
                }}
                onFailure={error}
                isSignedIn={true}
                clientId="934206010022-4f2a0rltvpfscgj4dsavvjku5h23t77f.apps.googleusercontent.com"
            >
                Login
            </GoogleLogin>
        )
    }

    // return <button onClick={() => toggleShow(true)}>show button</button>
    return <Logout/>;
};

const Logout = () => {
    const [loggedIn, toggleShow2] = useState(true);
    const [, updateState] = React.useState();
    const forceUpdate = useCallback(() => updateState({}), []);

    if (loggedIn) {
        console.log("show logout");
        console.log(clientImage);

        return (
            <GoogleLogout
                onLogoutSuccess={res => {
                    toggleShow2(false);
                    forceUpdate();
                    logout(res)
                }}
                onFailure={error}
                icon={false}
                clientId="934206010022-4f2a0rltvpfscgj4dsavvjku5h23t77f.apps.googleusercontent.com"
            >
               <img
                src={clientImage}
                alt="new"
            />
            </GoogleLogout>
        )
    }
    return <Login/>;
};


const routing = (
    <Router>
        <div>
            <Navbar>
                <NavLink href="/">Meal plan</NavLink>
                <NavLink href="/newrecipe">Add new recipe</NavLink>
                <NavLink><Login/></NavLink>
            </Navbar>
            <Route exact path="/" component={App} />
            <Route path="/newrecipe" component={RecipeForm} />
            <Route path="/editRecipe" component={RecipeForm} />
        </div>
    </Router>
);
ReactDOM.render(routing, document.getElementById('root'))

// https://codeburst.io/getting-started-with-react-router-5c978f70df91
//https://github.com/anthonyjgrove/react-google-login/blob/master/demo/app.js