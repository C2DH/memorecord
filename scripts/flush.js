const fs          = require('fs'),
      db          = require('diskdb'),
      clc         = require('cli-color'),
      YAML        = require('yamljs'),
      settings    = require('./settings.js'),

      _ye = clc.yellowBright,
      _bl = clc.blackBright,
      _gr = clc.greenBright.bold,
      _err = clc.magentaBright.bold;

      
db.connect(settings.diskdb.path, ['records']);

console.log('records found:',_ye( db.records.count()));
console.log(_bl('Saving yaml file:'),settings.yaml.documents.path);
fs.writeFile(settings.yaml.documents.path, YAML.stringify(db.records.find(), 4), err => {
  if(err) {
    console.log(_err('Error!'));
    console.error(err);
  } else {
    console.log(_gr('✓'), _bl('done.'));
  }
});
