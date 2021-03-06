const db = require("../models");

module.exports = {
    search: function(req, res) {
        //Returns all recipes whose name or ingredients contains the search query, case insensitively.
        //TODO: Input sanitization.
        const query = decodeURI(req.params.queryString);
        db.Recipe.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                {
                    ingredients: {
                        $elemMatch: { name: { $regex: query, $options: "i" } }
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
    },
    create: function(req, res) {
        db.Recipe.create(req.body)
            .then(dbModel => res.json(dbModel))
            .catch(err => res.status(422).json(err));
    }
};
