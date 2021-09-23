//this is assuming a nodejs server environment
var postQuery = 'grant_type=client_credentials';
var request = require('request');
var express = require('express');
var app = express();

app.get('/getToken', function(req, res){
  request({
    url: "https://accounts.spotify.com/api/token",
    method: "POST",
    headers: {
      'Authorization': `Basic ${req.query.base64Encoded}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postQuery.length
    },
    body: postQuery
  }, function (error, response, data){
    //send the access token back to client
    res.end(data);
  });    
});

app.listen(3000, ()=>{
    console.log("thing is running on 3000")
})