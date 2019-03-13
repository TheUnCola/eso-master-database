let ut = require('unix-timestamp'),
    moment = require('moment');

let lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('DepositExporter.lua')
});


let firebase = require("firebase-admin");

/*let config = {
    apiKey: "AIzaSyD54XbMUHkUzh5pGraM2QgOF3CoNubYmmg",
    authDomain: "numenor-database.firebaseapp.com",
    databaseURL: "https://numenor-database.firebaseio.com"
};*/

//let config = require("./config");

let secret = require("./secret");

firebase.initializeApp({
    credential: firebase.credential.cert(secret),
    databaseURL: "https://numenor-database.firebaseio.com"
});

let db = firebase.database();

let ref = db.ref('/deposits');

ref.on("value", function(snapshot) {
    console.log(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

let readNow = false;
lineReader.on('line', function (line) {
    if(line.includes("\"EXPORT\"")) readNow = true;
    if(readNow && line.includes("}")) readNow = false;

    if(readNow && !line.includes("\"EXPORT\"") && !line.includes("{")) {
        let lineMod = line.split("\"")[1];

        let name = lineMod.split("&")[0];
        let val = lineMod.split("&")[1];
        let timestamp = lineMod.split("&")[2];
        let date = moment(ut.toDate(parseInt(timestamp))).format('YYYY-MM-DD');
        let time = moment(ut.toDate(parseInt(timestamp))).format('HH:mm:ss');

        console.log(name,val,date,time);
    }
});
