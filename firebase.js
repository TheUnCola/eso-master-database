let Promise = require('bluebird'),
    firebase = require("firebase-admin"),
    secret = require("./secret");

let Firebase = {
    initializeDB: function() {
        firebase.initializeApp({
            credential: firebase.credential.cert(secret),
            databaseURL: "https://numenor-database.firebaseio.com"
        });

        return firebase.database();
    },

    getDeposits: function() {
        let db = this.initializeDB();

        return new Promise(function (resolve, reject) {
            db.ref('/deposits').once("value", function(snapshot) {
                firebase.app().delete();
                resolve(snapshot.val());
                }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                });
        });
    },

    updateDB: function(entries) {
        let db = this.initializeDB();

        return new Promise(function (resolve, reject) {
            db.ref().update(entries, () => {
                console.log("done updating");
                firebase.app().delete();
                resolve(true);
            });
        });
    }
};

module.exports = Firebase;