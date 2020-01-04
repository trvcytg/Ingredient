const db = require("../models");

module.exports = {
    search: function(req, res) {
        //Returns all recipes whose name or ingredients contains the search query.
        //TODO: Input sanitization.
        const query = decodeURI(req.params.queryString);
        //const regex = new RegExp(".*" + query + ".*");
        db.Recipe.find({
            $or: [
                { name: query },
                {
                    ingredients: {
                        name: query,
                        amount: 1
                    }
                }
            ]
        })
            .then(dbModel => res.json(dbModel))
            .catch(err => res.status(422).json(err));
    },
    findById: function(req, res) {
        db.Recipe.findById(req.params.id)
            .then(dbModel => res.json(dbModel))
            .catch(err => res.status(422).json(err));
    }
};
