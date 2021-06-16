const fs = require('fs');

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms);
    })
}
function writeJson(file, data) { //write json to file with tabulators and new lines
    fs.writeFileSync(file, data, 'utf8');
}

// export only executable function
module.exports.sleep = sleep;
module.exports.writeJson = writeJson;
