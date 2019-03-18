let ut = require('unix-timestamp'),
    moment = require('moment'),
    Promise = require('bluebird'),
    uuid = require('uuid');

let Helper = {
    readExport: function(file) {
        let lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(file)
        });
        return new Promise(function (resolve, reject) {
            let readNow = false, exports = [];
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
            
                    exports.push({
                        "name": name,
                        "amount": val,
                        "date": date,
                        "time": time,
                        "timestamp": timestamp
                    });
                }
            });
            lineReader.on('close', ()=> {
                return resolve(exports);
            });
        });
    },

    checkForDuplicates: function (exports, dbEntries) {
        let entries = {};
        for(let i = 0; i < exports.length; i++) { // Iterate of ESO Exports
            let entryExists = false;
            Object.keys(dbEntries).forEach(function(entry) { // Iterate over current DB Values
                let dbEntry = dbEntries[entry];

                // If already exists in DB, then we'll ignore to avoid duplicates
                if(exports[i].name == dbEntry.name && exports[i].amount == dbEntry.amount && exports[i].timestamp == dbEntry.timestamp) {
                    console.log(exports[i].name + ' & ' + exports[i].timestamp + ' exists!');
                    entryExists = true;
                }
            })
            
            if(!entryExists) {
                entries['/deposits/' + uuid()] = exports[i]; // Will want to stop hardcoding this eventually...
            }
        }

        return entries;
    }
};

module.exports = Helper;