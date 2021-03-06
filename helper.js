let ut = require('unix-timestamp'),
    moment = require('moment'),
    Promise = require('bluebird'),
    uuid = require('uuid'),
    fs = require('fs');

let Helper = {
    readDepositExport: function(file) {
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
        let entries = {}, duplicates = [];
        for(let i = 0; i < exports.length; i++) { // Iterate of ESO Exports
            let entryExists = false;
            Object.keys(dbEntries).forEach(function(entry) { // Iterate over current DB Values
                let dbEntry = dbEntries[entry];

                // If already exists in DB, then we'll ignore to avoid duplicates
                if(exports[i].name == dbEntry.name && exports[i].amount == dbEntry.amount && (exports[i].timestamp == dbEntry.timestamp || exports[i].timestamp == parseInt(dbEntry.timestamp)-1 || exports[i].timestamp == parseInt(dbEntry.timestamp)+1)) {
                    console.log(exports[i].name + ' & ' + exports[i].timestamp + ' exists!');
                    entryExists = true;
                }
            });
            
            if(!entryExists) {
                entries['/numenor/deposits/' + uuid()] = exports[i]; // Will want to stop hardcoding this eventually...
            } else {
                duplicates.push(exports[i]);
            }
        }

        return { "entries": entries, "duplicates": duplicates };
    },

    readBankExport: function(file) {
        let entries = {};
        let lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(file)
        });
        return new Promise(function (resolve, reject) {
            let readNow = false, exports = [], name = "", qty = 0, bracketCount = 0;
            lineReader.on('line', function (line) {
                if(line.includes("\"Numenor Exchange\"")) readNow = true;
                if(readNow && line.includes("{")) bracketCount++;
                else if(readNow && line.includes("}")) bracketCount--;
                if(readNow && !line.includes("\"Numenor Exchange\"") && bracketCount == 0) readNow = false;
            
                if(readNow && !line.includes("\"Numenor Exchange\"") && !line.includes("{") && (line.includes("[\"Name\"]") || line.includes("[\"Qty\"]"))) {
                    let lineMod = line.split("=")[1].trim();
                    lineMod = lineMod.substr(0,lineMod.length-1); //Get rid of trailing comma
                    lineMod = lineMod.replace(/\"/g, ""); //Get rid of ""

                    if(line.includes("[\"Name\"]")) name = lineMod;
                    else if(line.includes("[\"Qty\"]")) {
                        qty = lineMod;
                        entries['/numenor/bank/' + uuid()] = {
                                "name": name,
                                "qty": qty,
                            };
                    }
                }
            });
            lineReader.on('close', ()=> {
                return resolve(entries);
            });
        });
    },

    logOutput: function (dbRecords, exports, entries, duplicates) {
        let timestamp = moment().format("YYYY-MM-DDTHHmmss");
        let output = {
            "timestamp": timestamp,
            "dbRecords": dbRecords,
            "exports": exports,
            "entries": entries,
            "duplicates": duplicates
        };
        fs.writeFileSync("logs/log_" + timestamp + ".json", JSON.stringify(output, null, 2));
    }
};

module.exports = Helper;