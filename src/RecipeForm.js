import React from 'react';
import Chips from 'react-chips'
import {BACKEND_URL} from "./constants";

/*
TODO
- URL validator https://goshakkk.name/instant-form-fields-validation-react/
- common sign-in/sign-out button
 */


class RecipeForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipe_name: '',
            url: '',
            categories: [],
            difficulty: '',
            period: 0,
            notes: "",
            chips:[],
            suggestions: [
            ],
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChipsChange = this.onChipsChange.bind(this);
        this.getCategoriesSuggestions = this.getCategoriesSuggestions.bind(this);
        this.getCategoriesSuggestions();
    }

    handleChange(event) {
        this.setState({
            ...this.state,
            [event.target.name]: event.target.value
        });
    }

    onChipsChange = chips => {
        this.setState({
            ...this.state,
            categories: chips });
    };

    getCategoriesSuggestions() {
        fetch(BACKEND_URL + '/api/categories')
            .then(res => res.json())
            .then(data => {
                this.setState({
                    ...this.state,
                    suggestions:data['recipes']
                })
            });
    }

    handleSubmit(event) {
        event.preventDefault();
        const newRecipe =  {
            name: this.state.recipe_name,
            url: this.state.url,
            categories: this.state.categories,
            difficulty: this.state.difficulty,
            period: this.state.period,
            notes: this.state.notes,
        };

        fetch(BACKEND_URL + '/api/recipes/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newRecipe)
        }).then(res => {
            console.log(res);
        });
        this.setState({
            recipe_name: '',
            url: '',
            categories: [],
            difficulty: '',
            period: 0,
            chips:[],
            notes: "",
            suggestions: this.state.suggestions,
        });
    }

    render() {
        return (
        <div>
            <form onSubmit={this.handleSubmit}>
                <label>
                    Name:
                    <input type="text" name="recipe_name" value={this.state.recipe_name} onChange={this.handleChange} />
                </label>
                <br/>
                <label>
                    URL:
                    <input type="text" name="url" value={this.state.url} onChange={this.handleChange} />
                </label>
                <br/>
                <label>
                    Categories:
                    <Chips
                        name="categories"
                        value={this.state.categories}
                        onChange={this.onChipsChange}
                        suggestions={this.state.suggestions}
                        fromSuggestionsOnly={false}
                    />
                </label>
                <br/>
                <label>
                    Difficulty:
                    <select  name="difficulty" value={this.state.difficulty} onChange={this.handleChange}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option selected value="hard">Hard</option>
                    </select>
                </label>
                <br/>
                <label>
                    Period:
                    <input type="number" name="period" value={this.state.period} onChange={this.handleChange} />
                </label>
                <br/>
                <label>
                    Notes:
                    <input type="text" name="notes" value={this.state.notes} onChange={this.handleChange} />
                </label>
                <br/>
                <input type="submit" value="Submit" />
            </form>
        </div>
        );
    }
}

export default RecipeForm;