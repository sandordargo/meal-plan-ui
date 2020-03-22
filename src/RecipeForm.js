import React, { Component } from 'react';
import Autocomplete from 'react-autocomplete-tags'
const BE_URL = "https://meal-planner-be.herokuapp.com";
import Chips, { Chip } from 'react-chips'

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

const Suggestions = [
    {
        label: 'Suggestions 1',
        value: '1'
    },
    {
        label: 'Suggestions 2',
        value: '2'
    },
    {
        label: 'Another suggestions',
        value: 'X'
    }
];

class RecipeForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipe_name: '',
            url: '',
            categories: [],
            difficulty: '',
            period: 0,
            chips:[],
            suggestions: [
            ],
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.getCategoriesSuggestions = this.getCategoriesSuggestions.bind(this);
        this.getCategoriesSuggestions();
    }

    handleChange(event) {
        console.log(event);
        this.setState({
            ...this.state,
            [event.target.name]: event.target.value
        });
    }

    onChange = chips => {
        this.setState({
            ...this.state,
            categories: chips });
    };

    getCategoriesSuggestions() {
        console.log("called");
        fetch(BE_URL + '/api/categories')
            .then(res => res.json())
            .then(data => {
                // console.log(data['recipes']);
                // return  data['recipes'];
                this.setState({
                    ...this.state,
                    suggestions:data['recipes']
                })
            });
    }

    handleSubmit(event) {
        event.preventDefault();
        const obj =  {
            name: this.state.recipe_name,
            url: this.state.url,
            categories: this.state.categories,
            difficulty: this.state.difficulty,
            period: this.state.period,
        };
        console.log(this.state.chips);

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
            categories: [],
            difficulty: '',
            period: 0,
        });
    }

    render() {
        return (
<div>
    <div>
    </div>
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
                    <Chips
                        name="categories"
                        value={this.state.categories}
                        onChange={this.onChange}

                        // fetchSuggestions={(value) => this.getCategoriesSuggestions}
                        // fetchSuggestions={(value, callback) => {
                        //     fetch(BE_URL + '/api/categories')
                        //         .then(res => res.json())
                        //         .then(data => {
                        //             console.log(data['recipes']);
                        //             callback(data['recipes']);
                        //         });
                        // }}
                        suggestions={this.state.suggestions}
                        fromSuggestionsOnly={false}
                        // https://www.npmjs.com/package/react-chip-input talan
                    />

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
</div>
        );
    }
}

export default RecipeForm;