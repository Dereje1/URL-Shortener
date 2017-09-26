var express = require('express');
var app = express();

let mongo = require('mongodb').MongoClient

let dbLink =process.env.MONGOLAB_URI


app.use(express.static('public'));

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

createDBNew(dbLink).then(function(dbStatus){
  console.log(dbStatus)
})

app.get("/:shorturlVal", function (req, res) {
  let shortURLID = req.params.shorturlVal
  let lookForURL = findURL(dbLink,shortURLID,false)
  lookForURL.then(function(found){
    if(found.length===0){
      res.send("Can Not find URL ID " + shortURLID)
      res.end()
    }
    else{
      res.redirect(found[0]['originalURL'])
      res.end()
    }
  })
});


app.get('/input/:linkVal*', function(req,res){///does not take care of ? and possibly other characters
  let originalURL = req.params.linkVal+req.params['0']
  let urlValidity = /^(ftp|http|https):\/\/[^ "]+$/.test(originalURL);
  if(!urlValidity){
    res.end("Invalid URL detected, Try again!")
  }
  let shortURLID = makeid()
  //first find if it is a duplicate url
  let duplicateURL = findURL(dbLink,originalURL)
  duplicateURL.then(function(urldocs){
    if(urldocs.length===0){//insert a new URL document
      insertURL(dbLink,originalURL,shortURLID).then(function(report){
        res.end("Original URL: " + originalURL +
                "\nNew ID      : " + shortURLID +
                "\nNew Link    : " + req.headers.referer + shortURLID +
                "\nCreated     : " + Date(Date.now().toString()))

      })
    }
    else{//respond with the existing document
      res.end("Original URL: " + urldocs[0]["originalURL"] +
              "\nID          : " + urldocs[0]["shortenedURL"] +
              "\nLink        : " + req.headers.referer + urldocs[0]["shortenedURL"] +
              "\nCreated     : " + new Date(urldocs[0]["timeStamp"]).toString())
    }
  })
})

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

//all custom defined functions below, may try to include into an import in the future
function makeid() {
  var randomText = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    randomText += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomText;
}

function createDBNew(dbLink){
  let coll//if  not declared here will not be recognized down stream of the promises
  return mongo.connect(dbLink)
    .then(function(db){
      coll = db.collection('URLColl')
      return coll.count()
    })
    .then(function(docCount){
      if(docCount===0){//initialize db with record if no records
        let insertedObject = {
          originalURL: "Database Initialization",
          shortenedURL: "Database Initialization",
          timeStamp: Date.now()
        }
        console.log("Initializing collection with " + JSON.stringify(insertedObject))
        coll.insert(insertedObject)
        return "Database Created"
      }
      else{
        return "Database already exists"
      }
    })
    .catch(function(err) {
        console.log("Error in Database Creation Module!!")
        throw err;
    });
}

function findURL(dbLink,userQuery, bylink=true){
  let query = bylink ? {originalURL: userQuery} : {shortenedURL: userQuery}
  return mongo.connect(dbLink)
    .then(function(db){
      let collection = db.collection('URLColl')//first specify collection
      return collection.find(query).toArray()
    })
    .then(function(items) {
      return items
    })
    .catch(function(err) {
        throw err;
    });
}
function insertURL(dbLink,original,idURL){
  return mongo.connect(dbLink)
    .then(function(db){
      let collection = db.collection('URLColl')//first specify collection
      let insertedObject = {
        originalURL: original,
        shortenedURL: idURL,
        timeStamp: Date.now()
      }
      return collection.insert(insertedObject)
    })
    .then(function(newInsertion){
      console.log(original + " succesfully entered into DB")
    })
    .catch(function(err) {
        throw err;
    });
}
