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
		numerator: 7,
		denominator: 10,
		undirected: 'true',
		weighted: 'false',
		firstQuestion: 0,
		lastQuestion: 3,
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
	// create a brand new graph - randomly choose nodes and edges
	this.graphModel.createNewGraph();
	// choose a new set of random questions
	this.graphModel.createNewQuestions();
	// choose a question randomly
	this.graphModel.chooseQuestion();
	// store the answer(s) to the question we chose in the last step
	this.graphModel.setAnswers();
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
