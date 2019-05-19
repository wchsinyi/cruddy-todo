const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
Promise.promisifyAll(fs);

// var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId(
    (err, nString) => {
      fs.writeFile(path.join(exports.dataDir, nString + '.txt'), text,
        (err) => { callback(err, { id: nString, text }); });
    }
  );
};

// Note -- one of them works and one of them doesn't work  
// ############## CORRECT ###################
exports.readAll = (callback) => {
  fs.readdirAsync(exports.dataDir, 'utf8')
    .then(
      files => {
        Promise.all(
          files.map( (item, idx ) => {
            return fs.readFileAsync(path.join(exports.dataDir, item), 'utf8')
              .then( 
                txt => {  
                  var obj = {};
                  obj['id'] = item.replace('.txt', '');
                  obj['text'] = txt;
                  return obj;
                }
              ); 
            }
          )
        ).then(data =>{ callback(null, data);});
      }
    )
  };

// ############## INCORRECT ###################

// exports.readAll = (callback) => {
//   fs.readdirAsync(exports.dataDir, 'utf8')
//   .then(
//     files => {
//       Promise.all(
//         files.map( (item, idx ) => {
//           return fs.readFileAsync(path.join(exports.dataDir, item), 'utf8')
//             .then( 
//               txt => {  
//                 var obj = {};
//                 obj['id'] = item.replace('.txt', "") ;
//                 obj['text'] = txt;
//                 return obj
//                   }
//                 ); 
//               }
//             )
//         )
//     }
//   ).then(data =>{ console.log('data', data); callback(null, data);});
// };


// ############## Example of using Promise.all ###################
var t = new Array(10).fill(0).map( (i, idx)=> idx*100 );
var newt = t.map(function(j, idx){
  return new Promise((resolve, reject)=>{
    resolve({id: idx, text: j});
  })
  .then( result => {
    console.log(result);
    }
  )
})
Promise.all(newt).then(data=>{console.log(data)})
// ###############################################################

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'), 'utf8', (err, fileData) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text: fileData })
    }
  })
};

exports.update = (id, text, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'), 'utf8', (err, fileData) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(path.join(exports.dataDir, id + '.txt'), text,
        (err) => { callback(err, { id, text }) });
    }
  })

  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
};

exports.delete = (id, callback) => {
  fs.unlink(path.join(exports.dataDir, id + '.txt'), (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  })
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
