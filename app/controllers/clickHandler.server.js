'use strict';
var jade = require("jade");
var Charts = require('../models/charts.js');
var Users = require('../models/users.js');
var request = require("request");



var ONEDAY = 10000000;

//		  var   highcharts = require('node-highcharts')

// var Highcharts = require('highcharts');

// // Alternatively, this is how to load Highstock or Highmaps 
// // var Highcharts = require('highcharts/highstock'); 
// // var Highcharts = require('highcharts/highmaps'); 

// // This is how a module is loaded. Pass in Highcharts as a parameter. 
// require('highcharts/modules/exporting')(Highcharts);

function ClickHandler() {

	this.getClicks = function(req, res) {
		Users
			.findOne({
				'github.id': req.user.github.id
			}, {
				'_id': false
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}

				res.json(result.nbrClicks);
			});
	};

	this.addClick = function(req, res) {
		Users
			.findOneAndUpdate({
				'github.id': req.user.github.id
			}, {
				$inc: {
					'nbrClicks.clicks': 1
				}
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}

				res.json(result.nbrClicks);
			});
	};

	this.resetClicks = function(req, res) {
		Users
			.findOneAndUpdate({
				'github.id': req.user.github.id
			}, {
				'nbrClicks.clicks': 0
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}

				res.json(result.nbrClicks);
			});
	};


	this.main = function(req, res) {

		var filepath = __dirname + "/" + "main.jade";
		console.log(filepath);

		res.end(jade.renderFile(filepath));

	};

	this.getChart = function(req, res) {
		var name = req.params.id.toLowerCase();
	//	console.log(" " + name);



		Charts.findOne({
				name: name
			}, {
				'_id': false
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
			//	console.log("First found:" + (result == null));
				if (result == null) {
					console.log(1);

					getC(name, function(error, response, body) {
						body = JSON.parse(body);

						if (body.quandl_error) {
							console.log(JSON.stringify(body) + "+" + name);
							if (body.quandl_error.code === 'QECx02')
								res.end(JSON.stringify({
									error: "Wrong code"
								}));
							else
								res.end(JSON.stringify({
									error: "error pls reload"
								}));
							return;
						}
						res.end(JSON.stringify(body));
						var chart = new Charts({
							name: name,
							data: body,
							updated: new Date()
						});

						chart.save();

					})
				}
				else if (new Date() - result.updated > ONEDAY) {
					console.log(2);
					getC(name, function(error, response, body) {
						body = JSON.parse(body);
						if (body.quandl_error) {
							console.log(JSON.stringify(body) + "+" + name);
							if (body.quandl_error.code === 'QECx02')
								res.end(JSON.stringify({
									error: "Wrong code"
								}));
							else
								res.end(JSON.stringify({
									error: "error pls reload"
								}));
							return;
						}
						res.end(JSON.stringify(body));
						Charts
							.findOneAndUpdate({
								name: name
							}, {
								$set: {
									"data": body,
									"updated": new Date()
								}
							},
							function(err,result){
								//console.log(result);
							});


					})

				}
				else {
					console.log(3);
					res.end(JSON.stringify(result.data));
				}


			});
		//	'https://www.quandl.com/api/v3/datasets/WIKI/' + name.toLowerCase() + '.csv?api_key=o1DVmHWPWciMn5WLBU21'
		//('https://www.quandl.com/api/v3/datasets/YAHOO/MSFT.json?start_date=2015-01-03&end_date=2015-02-03&order=asc'


	}

}


function getC(name, func) {
	request({
		uri: 'https://www.quandl.com/api/v3/datasets/WIKI/' + name + '.json?api_key=o1DVmHWPWciMn5WLBU21&&order=asc',
		//uri: 'https://www.quandl.com/api/v3/datasets/YAHOO/' + name + '.json?start_date=2015-01-03&end_date=2015-02-03&order=asc',
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 10
	}, func);

}
module.exports = ClickHandler;
