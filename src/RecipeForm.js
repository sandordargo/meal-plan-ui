import React, { Component } from 'react';
const BE_URL = "https://meal-planner-be.herokuapp.com";

/*
TODO
- BE_URL at one central place
- fields are vertical
- pass remarks
- clean up code
- URL validator https://goshakkk.name/instant-form-fields-validation-react/
DONE - difficulty from drop down list
DONE - clean up form after submitting
- categories?
- - needs multiple selection
- - from where should I manage categories?
- deploy
- common sign-in/sign-out button
 */

class RecipeForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipe_name: '',
            url: '',
            categories: '',
            difficulty: '',
            period: 0,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({
            ...this.state,
            [event.target.name]: event.target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const categoriesArr =  this.state.categories.split(" ");
        const obj =  {
            name: this.state.recipe_name,
            url: this.state.url,
            categories: categoriesArr,
            difficulty: this.state.difficulty,
            period: this.state.period,
        };

        fetch(BE_URL + '/api/recipes/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(obj)
        }).then(res => {
            console.log(res);
        });
        this.setState({
            recipe_name: '',
            url: '',
            categories: '',
            difficulty: '',
            period: 0,
        });
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Name:
                    <input type="text" name="recipe_name" value={this.state.recipe_name} onChange={this.handleChange} />
                </label>
                <label>
                    URL:
                    <input type="text" name="url" value={this.state.url} onChange={this.handleChange} />
                </label>
                <label>
                    Categories:
                    <input type="text" name="categories" value={this.state.categories} onChange={this.handleChange} />
                </label>
                <label>
                    Difficulty:
                    <select  name="difficulty" value={this.state.difficulty} onChange={this.handleChange}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option selected value="hard">Hard</option>
                    </select>
                </label>
                <label>
                    Period:
                    <input type="number" name="period" value={this.state.period} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

export default RecipeForm;