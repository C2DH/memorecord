/**/
const fs          = require('fs'),
      db          = require('diskdb'),
      ns          = require('nested-structure'),
      clc         = require('cli-color'),
      path        = require('path'),
      YAML        = require('yamljs'),
      async       = require('async'),
      request     = require('request'),
      settings    = require('./settings.js'),
      moment      = require('moment'),
      credentials = require(settings.google_spreadsheet_to_json.credentials),
      
      gsjson = require('google-spreadsheet-to-json');


console.log('Loading Google spreadsheet GID:', settings.google_spreadsheet_to_json.documents.gid);

db.connect(settings.diskdb.path, ['records']);

console.log(db.records.count());

let c = 0;

const _cy = clc.cyanBright,
      _ye = clc.yellowBright,
      _bl = clc.blackBright,
      _gr = clc.greenBright.bold;




async.waterfall([

  // load data from spreadsheet.
  (next) => {
    c++;
    console.log(_cy(c, '.'), _bl('load data from spreadsheet:'), settings.google_spreadsheet_to_json.documents.gid);
    gsjson({
      spreadsheetId: settings.google_spreadsheet_to_json.documents.gid,
      credentials: credentials,
      allWorksheets: true
    }).then(res => {
      console.log(_gr('    v'), _bl('request success!\n      - n.sheets:'), res.length)
      let results = [];

      res.forEach(d => {
        results = results.concat(d);
      });

      // console.log(results);
      
      results = results.filter(d => d.uid || d.id);
      
      
      console.log(_bl('      - n. valid records:'), results.length);
      
      next(null, results)
    }).catch(next);
  },

  (results, next) => {
    c++;
    console.log(_cy(c, '.'), _bl('merge with alread stored records'))
    
    results
      .map(d => {
        // console.log(d)
        let _d = {
          uid: d.uid || d.id,
          description: d.caption || d.description,
          image: d.image || d.picture,
          url: d.url
        };

        // add geometry if there is a valid lat and lon
        if(d.lat){
          _d.geometry = {
            "type": "Point",
            "coordinates": [
              d.lng,
              d.lat
            ]
          };
        }
        
        // clean url
        if(d.url && d.url.length) {
          _d.url = d.url.trim();
          _d.provider = 'instagram';
        } else if (d.link && d.link.length) {
          _d.url = d.link.trim();
          _d.provider = 'facebook';
        }
        
        // clean date for instagram
        if(d.date) {
          
          _d.date = moment(d.date, 'X').format('YYYY-MM-DD');

          // later with javascrip Date object do: d=neww Date() d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        } else if (d.created_time) {
          _d.date = moment(d.created_time).format('YYYY-MM-DD');
        }

        // console.log(d, _d)

        return _d;
      }).forEach(d => {
        console.log(_bl('    merging:'), '/',_ye(d.uid),'/');
        // get if any
        let org = db.records.findOne({uid: d.uid});
        if(org){
          // d.data = { ... org.data, ... d.data}
          db.records.update({
            _id: org._id, 
          }, d, {
            upsert: true
          })
        } else{
          // last slug win all
          db.records.update({
            uid: d.uid, 
          }, d, {
            upsert: true
          })
        }
      });
    next(null, results);
    // setImmediate(next);
  },
], (err) => {
  if (err) throw err;
  else{
    console.log(_gr('done!'));
  }
})


    //let datafields = results.
  // open then write json
  

