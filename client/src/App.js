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
    let ingredientAmount = 0;
    for (const item of pantry) {
      if (item.name === ingredient) {
        ingredientAmount = item.amount;
      }
    }
    groceries[ingredient] -= ingredientAmount;
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

        // sets to 1 for now, not checking amounts
        // groceries[ingredient.name] += ingredient.quantity;
        groceries[ingredient.name] = 1;
      });
    }

    for (const item in groceries) {
      this.pantryCheck(item, groceries);
    }

    // will use an ingredient library to convert units to purchasable amount
    this.setState({ shoppingList: groceries });
  }

  loadPantry = id => {
    API.getUser(id).then(user => {
      this.setState({
        ingredients: user.data.ingredients,
        queuedRecipes: user.data.queuedRecipes
      });
      this.generateList(user.data.queuedRecipes);
    });
  };

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
              <Login firebase={firebase} openLogin={this.openLogin} />
            )}
          </FirebaseContext.Consumer>
        ) : this.state.headerState === "signup" ? (
          <FirebaseContext.Consumer>
            {firebase => (
              <SignUpForm firebase={firebase} openSignup={this.openSignup} />
            )}
          </FirebaseContext.Consumer>
        ) : null}

        <Footer />
      </Router>
    );
  }
}

export default App;
