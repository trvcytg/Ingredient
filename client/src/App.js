import "bulma/css/bulma.css";

import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import Pantry from "./pages/Pantry";
import Shoplist from "./pages/Shoplist";
import API from "./utils/API";
import Recipes from "./pages/Recipes";

import Login from "./components/auth/login";
import SignUpForm from "./components/auth/signup";

import { FirebaseContext } from "./components/firebase/context";

const initialState = {
    headerState: "main",
    authUser: null,
    username: "",
    ingredients: [],
    queuedRecipes: [],
    shoppingList: {}
};

class App extends React.Component {
    state = { ...initialState };

    componentDidMount() {
        this.props.firebase.auth.onAuthStateChanged(authUser => {
            this.setState({ authUser });

            if (this.state.authUser) {
                this.loadPantry(this.state.authUser.email);
            } else {
                this.setState({ ...initialState });
            }
        });
    }

    openLogin = () => {
        if (this.state.headerState === "login") {
            this.setState({ headerState: "main" });
        } else this.setState({ headerState: "login" });
    };
    openSignup = () => {
        if (this.state.headerState === "signup") {
            this.setState({ headerState: "main" });
        } else this.setState({ headerState: "signup" });
    };

    pantryCheck(ingredient, groceries) {
        const pantry = this.state.ingredients;
        let ingredientQuantity = 0;
        for (const item of pantry) {
            if (item.name === ingredient) {
                ingredientQuantity = item.quantity;
            }
        }
        groceries[ingredient] -= ingredientQuantity;
        if (groceries[ingredient] <= 0) {
            delete groceries[ingredient];
        }
    }

    generateList(mealPlan) {
        const groceries = {};

        // function generates combined ingredients list regardless of pantry quantity
        for (const meal in mealPlan) {
            const recipe = mealPlan[meal];
            // forEach and forIn are async, there's probably a cleaner way to do this
            recipe.ingredients.forEach(ingredient => {
                if (!groceries[ingredient.name]) {
                    groceries[ingredient.name] = 0;
                }

                // refactored to add quantity
                groceries[ingredient.name] += ingredient.quantity;
                // groceries[ingredient.name] = 1;
            });
        }
        for (const item in groceries) {
            this.pantryCheck(item, groceries);
        }

        // will use an ingredient library to convert units to purchasable amount
        this.setState({ shoppingList: groceries });
    }

    //Will be passed as prop to Recipes and Shoplist
    addToQueue = recipe => {
        API.getUser(this.state.userId).then(user => {
            const newRecipes = user.data.queuedRecipes;
            newRecipes.push(recipe);
            API.updateUser(this.state.userId, { queuedRecipes: newRecipes });
        });
    };

    removeFromQueue = recipeName => {
        API.getUser(this.state.userId).then(user => {
            const newRecipes = user.data.queuedRecipes;
            for (let i = 0; i < user.data.queuedRecipes.length; i++) {
                if (newRecipes[i].name === recipeName) {
                    newRecipes.splice(i, 1);
                }
            }
            API.updateUser(this.state.userId, { queuedRecipes: newRecipes });
        });
    };

    loadPantry = id => {
        API.getUser(id).then(user => {
            this.setState({
                ingredients: user.data.ingredients,
                queuedRecipes: user.data.queuedRecipes
            });
            this.generateList(user.data.queuedRecipes);
        });
    };

    render() {
        return (
            <Router>
                <Header />
                <Switch>
                    <Route path="/pantry">
                        <Pantry
                            ingredients={this.state.ingredients}
                            loadPantry={this.loadPantry}
                            userId={this.state.userId}
                        />
                        <Shoplist
                            ingredients={this.state.ingredients}
                            loadPantry={this.loadPantry}
                            shoppingList={this.state.shoppingList}
                            userId={this.state.userId}
                            queuedRecipes={this.state.queuedRecipes}
                            addToQueue={this.addToQueue}
                            removeFromQueue={this.removeFromQueue}
                        />
                    </Route>
                    <Route path="/">
                        <Recipes
                            userId={this.state.userId}
                            addToQueue={this.addToQueue}
                            removeFromQueue={this.removeFromQueue}
                        />
                    </Route>
                </Switch>
                <Footer />
            </Router>
        );
    }

    loadPantry = email => {
        API.getUser(email).then(user => {
            this.setState({
                username: user.data.username,
                ingredients: user.data.ingredients,
                queuedRecipes: user.data.queuedRecipes
            });

            this.generateList(user.data.queuedRecipes);
        });
    };

    render() {
        return (
            <Router>
                <FirebaseContext.Consumer>
                    {firebase => (
                        <Header
                            headerState={this.state.headerState}
                            openLogin={this.openLogin}
                            openSignup={this.openSignup}
                            firebase={firebase}
                            authUser={this.state.authUser}
                            username={this.state.username}
                        />
                    )}
                </FirebaseContext.Consumer>
                <Switch>
                    <Route path="/pantry">
                        {this.state.authUser ? (
                            <>
                                <Pantry
                                    authUser={this.state.authUser}
                                    ingredients={this.state.ingredients}
                                    loadPantry={this.loadPantry}
                                />
                                <Shoplist
                                    authUser={this.state.authUser}
                                    ingredients={this.state.ingredients}
                                    loadPantry={this.loadPantry}
                                    shoppingList={this.state.shoppingList}
                                    queuedRecipes={this.state.queuedRecipes}
                                />
                            </>
                        ) : (
                            ""
                        )}
                    </Route>

                    <Route path="/">
                        <Recipes authUser={this.state.authUser} />
                    </Route>
                </Switch>
                {this.state.headerState === "login" ? (
                    <FirebaseContext.Consumer>
                        {firebase => (
                            <Login
                                firebase={firebase}
                                openLogin={this.openLogin}
                            />
                        )}
                    </FirebaseContext.Consumer>
                ) : this.state.headerState === "signup" ? (
                    <FirebaseContext.Consumer>
                        {firebase => (
                            <SignUpForm
                                firebase={firebase}
                                openSignup={this.openSignup}
                            />
                        )}
                    </FirebaseContext.Consumer>
                ) : null}

                <Footer />
            </Router>
        );
    }
}

export default App;
