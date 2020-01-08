import React from "react";
import API from "../utils/API";
import PantryItem from "../components/pantryItem";

class Pantry extends React.Component {
  // instead of a toggle, this now just deletes an item off the pantry
  // adding ingredients manually should occur separately

  togglePantryItem(userEmail, ingredientName) {
    const newIngredients = this.props.ingredients;

    for (const ingredient of newIngredients) {
      if (ingredient.name === ingredientName) {
        // ingredient.quantity = (ingredient.quantity + 1) % 2;
        ingredient.quantity = 0;
      }
    }
    API.updateUser(userEmail, { ingredients: newIngredients });
    this.props.loadPantry(userEmail);
  }

  render() {
    return (
      <div className="tile is-parent">
        <article className="tile is-child notification is-bold is-success">
          <p className="title">My Pantry:</p>
          <p className="subtitle has-text-centered">
            {this.props.ingredients.map(ingredient => (
              <PantryItem
                name={ingredient.name}
                key={ingredient.name}
                quantity={ingredient.quantity}
                onClick={() =>
                  this.togglePantryItem(
                    this.props.authUser.email,
                    ingredient.name
                  )
                }
              />
            ))}
          </p>
        </article>
      </div>
    );
  }
}

export default Pantry;
