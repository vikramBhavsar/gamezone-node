const fs = require('fs');
const readline = require('readline')
const process = require('process')

console.log(process.cwd());
var path = 'ms.jpeg';


fs.access(path, fs.constants.R_OK,(err) => {
    if (err) {
        console.log("%s doesn't exist", path);
    } else {
        console.log('can read %s', path);
    }
});

fs.access(path, fs.constants.W_OK,(err) => {
    if (err) {
        console.log("%s doesn't exist", path);
    } else {
        console.log('can Write %s', path);
    }
});

fs.access(path, fs.constants.F_OK,(err) => {
    if (err) {
        console.log("%s doesn't exist", path);
    } else {
        console.log(`${path} - file exists`);
    }
});

var path2 = 'nothing.jpg';
fs.access(path2, fs.constants.F_OK,(err) => {
    if (err) {
        console.log("%s doesn't exist", path2);
    } else {
        console.log(`${path2} - file exists`);
    }
});

console.log('something');

const file = readline.createInterface({ 
    input: fs.createReadStream('index.js'), 
    output: process.stdout, 
    terminal: false
});

var count = 0;
file.on('line', (line) => { 
    console.log(line); 
    count +=1;
});

console.log(`Total Number of lines inside index.js is ${count}`);



