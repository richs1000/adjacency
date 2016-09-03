/*
 * main.js
 * Rich Simpson
 * August 4, 2015
 *
 * This code implements a mastery-based exercise on graph
 * theory for integration with Smart Sparrow.
 *
 * This is our controller - The C in MVC
 */


/*
 * Create the sim controller
 */
function GraphController() {
	// create a data model that exposes parameters to smart sparrow
	this.graphModel = new GraphModel(this, {
		mastery: 'false',
		numerator: 4,
		denominator: 5,
		undirected: 'true',
		weighted: 'false',
		firstQuestion: 0,
		lastQuestion: 0,
		doNotLaunch: true
	});
	// expose model data to Smart Sparrow
	pipit.CapiAdapter.expose('mastery', this.graphModel);
	pipit.CapiAdapter.expose('numerator', this.graphModel);
	pipit.CapiAdapter.expose('denominator', this.graphModel);
	pipit.CapiAdapter.expose('undirected', this.graphModel);
	pipit.CapiAdapter.expose('weighted', this.graphModel);
	pipit.CapiAdapter.expose('firstQuestion', this.graphModel);
	pipit.CapiAdapter.expose('lastQuestion', this.graphModel);
	pipit.CapiAdapter.expose('doNotLaunch', this.graphModel);

  myController = this;

	this.graphModel.on('change:numerator', function(){
		myController.graphView = new GraphView(this);
			myController.setupDisplay();
	});

	this.graphModel.on('change:denominator', function(){
		myController.graphView = new GraphView(this);
		myController.setupDisplay();
	});

	this.graphModel.on('change:weighted', function(){
		myController.graphView = new GraphView(this);
		myController.setupDisplay();
	});

	this.graphModel.on('change:undirected', function(){
		myController.graphView = new GraphView(this);
		myController.setupDisplay();
	});

	this.graphModel.on('change:firstQuestion', function(){
		myController.graphView = new GraphView(this);
		myController.setupDisplay();
	});

	this.graphModel.on('change:lastQuestion', function(){
		myController.graphView = new GraphView(this);
		myController.setupDisplay();
	});


	// let smart sparrow know that the sim is ready to accept values
	pipit.Controller.notifyOnReady();
	// set the answer history to empty
	this.graphModel.resetAnswerHistory();
	// initialize the view
	this.graphView = new GraphView(this);
	this.setupDisplay();
}


GraphController.prototype.setModelValue = function(_name, _newValue) {
	this.graphModel.set(_name, _newValue);
}


GraphController.prototype.getModelValue = function(_name) {
	return this.graphModel.get(_name);
}


GraphController.prototype.triggerCheck = function() {
	pipit.Controller.triggerCheck();
}

GraphController.prototype.setupDisplay = function() {
	// flip a coin to decide if the graph is directed or undirected
	var coin = getRandomInt(0, 2);
	// set the directed/undirected flag
	if (coin == 0)
		this.setModelValue('undirected', 'false');
	else
		this.setModelValue('undirected', 'true');
	// flip a coin to decide if the graph is directed or undirected
	coin = getRandomInt(0, 2);
	// set the directed/undirected flag
	if (coin == 0)
		this.setModelValue('weighted', 'false');
	else
		this.setModelValue('weighted', 'true');
	// create a brand new graph - randomly choose nodes and edges
	this.graphModel.createNewGraph();
	// choose a new set of random questions
	this.graphModel.createNewQuestions();
	// choose a question randomly
	this.graphModel.chooseQuestion();
	// draw the results for the last five questions
	this.graphView.drawAnswerHistory(this.graphModel.answerHistory);
	// draw the graph on the screen
	this.graphView.drawGraph(this.graphModel.nodes, this.graphModel.edges, this.graphModel.get('undirected') == 'true');
	// display the next question
	this.graphView.presentQuestion();
}


// Create a new Controller for sim
// The controller interacts with the model and the view
var graphController = new GraphController();


$(document).ready(function() {
	// let smart sparrow know that the sim is ready to accept values
	//pipit.Controller.notifyOnReady();
});
