/*
  Create tiny images to be used in the map.
  Save the result in the db.
*/
const fs          = require('fs'),
      db          = require('diskdb'),
      ns          = require('nested-structure'),
      clc         = require('cli-color'),
      path        = require('path'),
      YAML        = require('yamljs'),
      async       = require('async'),
      request     = require('request'),
      jimp          = require('jimp'),
      settings    = require('./settings.js');


const _cy  = clc.cyanBright,
      _ye  = clc.yellowBright,
      _bl  = clc.blackBright,
      _gr  = clc.greenBright,
      _err = clc.magentaBright.bold;


db.connect(settings.diskdb.path, ['records']);

console.log(db.records.count());

let records = db.records.find();

async.eachLimit(records, 1, (record, next) => {
  console.log('\n  record:',_ye(record._id))
  console.log(_bl('  url:'), record.image);
  const preview = path.join(settings.jimp.thumbnails.path, record._id);

  request(record.image).on('response', function(response) {
    console.log(_bl('  status code:'), response.statusCode) // 200
    console.log(_bl('  content-type:'), response.headers['content-type']) // 'image/png'
  }).pipe(fs.createWriteStream(preview)).on('close', () => {
    console.log(_gr('✓'), _bl('downloaded original file. Now opening image...'))
    jimp.read(preview, function (err, image) {
      // do stuff with the image (if no exception) 
      if(err) {
        console.log(_err('error!'), 'skipping!');
        console.error(err)
        next()
      } else {
        console.log(_gr('✓'), _bl('done. Now saving thumbnail...'));
        
        const thumbnail = path.join(settings.jimp.thumbnails.path, record._id + '-' + [
                settings.jimp.thumbnails.width,
                settings.jimp.thumbnails.height
              ].join('x') + '.jpg');

        image.resize(settings.jimp.thumbnails.width, settings.jimp.thumbnails.height)            // resize 
           .quality(60)                 // set JPEG quality 
           // .greyscale()                 // set greyscale 
           .write(thumbnail); // save 

        console.log(_gr('✓'), _bl('done. Now storing url in diskdb...'));
        
        let rec = db.records.findOne({_id: record._id});
        
        if(rec){
          // d.data = { ... org.data, ... d.data}
          record.thumbnail = {
            url: path.basename(thumbnail),
            width: settings.jimp.thumbnails.width,
            height:settings.jimp.thumbnails.height
          };
          db.records.update({
            _id: record._id, 
          }, record, {
            upsert: true
          })

          console.log(_gr('✓'), _bl('done. Next record...'));
        
        } else{
          console.log(_err('error!', 'skipping!'));
        }

        
        next()
      }
    });

  });

  
}, err => {
  if(err)
    throw err;
})
