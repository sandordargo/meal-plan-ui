import React from 'react';
import Chips from 'react-chips'
import {BACKEND_URL} from "./constants";

/*
TODO
- URL validator https://goshakkk.name/instant-form-fields-validation-react/
- common sign-in/sign-out button
 */

const initialState = {
    _id: '',
    recipe_name: '',
    url: '',
    categories: [],
    difficulty: 'easy',
    period: 60,
    notes: "",
    chips:[],
    suggestions: [
    ],
    editing_mode: false,
};

class RecipeForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState;

        if (typeof this.props.location.state !== 'undefined') {
            this.state = {
                ...this.state,
                _id:this.props.location.state.recipe._id,
                recipe_name:this.props.location.state.recipe.name,
                url:this.props.location.state.recipe.url,
                period:this.props.location.state.recipe.period,
                difficulty:this.props.location.state.recipe.difficulty,
                categories:this.props.location.state.recipe.categories,
                notes:this.props.location.state.recipe.notes,
                editing_mode: true
            };
        }


        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChipsChange = this.onChipsChange.bind(this);
        this.getCategoriesSuggestions = this.getCategoriesSuggestions.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    handleChange(event) {
        this.setState({
            ...this.state,
            [event.target.name]: event.target.value
        });
    }

    onChipsChange = chips => {
        const lowerChips = chips.map(chip => chip.toLowerCase());
        this.setState({
            ...this.state,
            categories: lowerChips });
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

    handleSubmit(event, addMore = false) {
        event.preventDefault();
        let newRecipe =  {
            name: this.state.recipe_name,
            url: this.state.url,
            categories: this.state.categories,
            difficulty: this.state.difficulty,
            period: this.state.period,
            notes: this.state.notes,
        };

        if (!this.state.editing_mode) {
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
            if (addMore) {
                this.setState(initialState);
            } else {
                this.props.history.push({
                    pathname: '/',
                    state: {
                        recipe: newRecipe
                    },
                });
            }

        } else {
           newRecipe['_id']=this.state._id;
           console.log(newRecipe);
            fetch(BACKEND_URL + '/api/recipes/edit', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRecipe)
            }).then(res => {
                console.log(res);
                this.props.history.push({
                    pathname: '/',
                    state: {
                        refresh: true
                    },
                });
            });
        }

    }

    cancel() {
        console.log();
        this.props.history.push({
            pathname: '/',
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
                <input type="button" value="Cancel" onClick={this.cancel} />
                <input type="submit" value="Add" />
                <input type="button" value="Add More" onClick={(event) => this.handleSubmit(event, true)} />
            </form>
        </div>
        );
    }
}

export default RecipeForm;