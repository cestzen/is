'use strict';
require('dotenv').config();
var path = process.cwd();
var mongo = require('mongodb');
var url = process.env.MONGOLAB_URI;
var acctKey = process.env.API_KEY;
var bing = require('node-bing-api')({ accKey: acctKey });


module.exports = function (app, passport) {

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

  app.route('/latestsearchestothisimagesearch')
		.get(function (req, res) {
			mongo.connect(url, function(err, db) {
			if(err) throw err;
			var collection = db.collection('fre');
  
		  collection.find({}).toArray(function(err, documents) {
	      if(err) throw err;
	      if(documents[0] == null) res.send("No query stored");
	      else{
	        var sender = [];
	        
	        for(var i = documents.length -10; i < documents.length; i++){
	          if(documents[i] != null){
		          sender.push({
                term : documents[i].term,
                when: documents[i].when
              });
	          }
		      }
	        
	        res.json(sender);
	      }
		 	
		 db.close();
		 })
}); 
		});

	app.route('/*')
		.get(function (req, res) {
		  var input = req.path;
      input = input.slice(1, input.length);

      mongo.connect(url, function(err, db) {
			  if(err) throw err;
			  var collection = db.collection('fre');
  
				  collection.insert({
    		  	term: input, when: new Date()
			  }, function(err, data) {
			     // handle error
			    if(err) throw err;
			    db.close();
			    var offset = 0;
		  if(req.query.offset != null){
		    offset = parseInt(req.query.offset);
		  }
		    bing.images(input, function(error, resp, body){
		      if(offset === 0)
		        offset = 50;
		      var results = [];
		      for(var i = 0; i < offset; i++){
		        if(body.d.results[i] != null){
		        results.push({
		        alt_text: body.d.results[i].Title,
		        source: body.d.results[i].SourceUrl,
		        image_url:body.d.results[i].MediaUrl
            });
		        }
		      }
          res.json(results);
        });
			   });

      }); 

      
		  
		});

};
