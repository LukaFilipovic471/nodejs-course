const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://lukakv34:mres7Oytc7GETpxj@cluster0.360mheo.mongodb.net/')
    .then(client => {
        console.log('conn');
        _db = client.db();
        callback();
    }).catch(err => {
        console.log(err);
        throw err;
    });
}

const getDb = () => {
    if(_db){
        return _db;
    }
    throw 'No database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;