/*
 * models.js
 * Rich Simpson
 * August 4, 2015
 *
 * This code implements a mastery-based exercise on graph
 * theory for integration with Smart Sparrow.
 *
 * This is our data model - The M in MVC
 */


/*
 * I use this function to empty out all of the arrays that
 * I use in this program.
 */
function emptyOutArray(myArray) {
	myArray.length = 0;
}


// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


/*
 * GraphNode represents the nodes within the state space graph.
 * A graph node has a unique ID. Depending on the search
 * algorithm being used, it may or may not have a heuristic
 * value indicating the node's distance from the goal node,
 * where a larger value indicates greater distance from the
 * goal. The node also has an array for keeping track of all
 * the times it appears in the search tree.
 */
function GraphNode(_nodeID) {
	// Node ID - unique for each node in graph
	this.nodeID = _nodeID || '';
} // GraphNode


/*
 * GraphEdge represents the edges/arcs between nodes in the
 * graph. A graph edge has a start node, an end node and a
 * cost, which may or may not be considered by the search
 * algorithm. For an undirected edge, you can either treat
 * a single edge as undirected or create two separate edges.
 */
function GraphEdge(_fromNodeID, _toNodeID, _cost, _showCost) {
	// start node
	this.fromNodeID = _fromNodeID || '';
	// end node
	this.toNodeID = _toNodeID || '';
	// cost of edge (g value)
  this.cost = _cost || 0;
	// flag I use to control whether cost gets drawn
	this.showCost = _showCost;
} // GraphEdge


/*
 * The GraphModel consists of an array of nodes and an array
 * of edges.
 */
function GraphModel(_controller, _attrs) {
	// save a link to the controller
	this.controller = _controller;
	// we want GraphModel to inherit from CapiModel so SmartSparrow
	// can access values within the model - here I call the CapiModel
	// constructor
	pipit.CapiAdapter.CapiModel.call(this, _attrs)
	// we need to keep track of the last <x> answers we've gotten
	// so we can test for mastery. we use an array as a queue that
	// stores as many answers as we're willing to consider
	this.answerHistory = [];

	// the things below are in the data model so I don't declare them here
	// this flag is set to true when the mastery condition is reached
	//this.mastery = false;
	// this is the numerator for the mastery condition - how many right
	//this.masteryNumerator = 4;
	// this is the denominator for the mastery condition - out of how many total?
	//this.masteryDenominator = 5;
	// the graph is directed or undirected
	// this.undirected = _undirected;
	// the graph has a weight associated with each edge
	// this.weighted = _weighted
	// the index of the first legal question template in the template array
	// this.firstQuestion = 0
	// the index of the last legal question template in the template array
	// this.lastQuestion = 4
} // GraphModel


/*
 * This defines CapiModel as the prototype for GraphModel, so we inherit
 * from CapiModel
 */
GraphModel.prototype = new pipit.CapiAdapter.CapiModel;


GraphModel.prototype.resetAnswerHistory = function() {
	for (var i = 0; i < this.get('denominator'); i++) {
		this.answerHistory.push(null);
	}
}


/*
 * Add a new item to the back of the answer history, pull an item off
 * the front. Since the queue starts out filled with nulls, it is always
 * the same size.
 */
GraphModel.prototype.updateAnswerHistory = function(newAnswer) {
	// add a new item to the back of the answer history
	this.answerHistory.push(newAnswer);
	// pull the oldest item off the front
	this.answerHistory.shift();
}


/*
 * Look at the answer history to see if we have met the criterion for
 * demonstrating mastery
 */
GraphModel.prototype.masteryAchieved = function() {
	// count up the number of right answers
	var count = 0;
	// loop through the answer history
	for (var i = 0; i < this.answerHistory.length; i++) {
		// if we got the question right
		if (this.answerHistory[i]) {
			// increase our count
			count += 1;
		}
	}
	// compare the correct count to our goal
	return count >= this.get('numerator');
}


/*
 * Compare the student's answer to the correct answer(s).
 */
GraphModel.prototype.checkAdjacencyMatrix = function (studentAnswer) {
	// loop through all the rows (the from nodes)
	for (var f = 0; f < this.adjacencyMatrix.length; f++) {
		// loop through all the columns within each row
		for (var t = 0; t < this.adjacencyMatrix[f].length; t++) {
			// compare the student's answer with the correct answer
			if (this.adjacencyMatrix[f][t] != studentAnswer[f][t]) {
				// if anything doesn't match, they got it wrong
				return false;
			}
		}
	}
	// everything matches, they got the question right
	return true;
}


GraphModel.prototype.checkAdjacencyList = function (studentAnswer) {
	// loop through all the nodes (the from nodes)
	for (var f = 0; f < this.nodes.length; f++) {
		// loop through all the elements within the adjacency list
		for (var t = 0; t < this.adjacencyList[f].length; t++) {
			// compare the student's answer with the correct answer
			if (this.adjacencyList[f][t] != studentAnswer[f][t]) {
				// if anything doesn't match, they got it wrong
				return false;
			}
		}
	}
	// everything matches, they got the question right
	return true;
}


/*

var headerString = "<th scope='row' text-align='center'>" + nodeID + "</th>";
bigTableString += headerString + "\n";
var rowString = "";
// one column for each node in adjacency list
for (var t = 0; t < this.controller.graphModel.adjacencyList[nodeID].length; t++) {
	var cellString = "<td><input type='text' class='form-control adjacencyMatrixSquare' id='aLS_" + f + "_" + t + "'></td>\n";
	rowString += cellString + "\n";
}
*/


GraphModel.prototype.checkAnswer = function(studentAnswer) {
	return this.checkAdjacencyList(studentAnswer);
}

/*
* This function empties out any old nodes from a previous graph and
* creates brand new nodes.
 * This function also gets rid of any old edges and then stores three
 * equivalent representations of the connections between nodes. The
 * edges list is what I actually use internally. The adjacency list
 * and adjacency matrix are used to answer questions posed to the
 * user.
*/
GraphModel.prototype.createNewGraph = function() {
	// reset array of nodes
	this.nodes = [];
// reset array of edges - starts off empty
	this.edges = [];
	// adjacency list - used to answer questions
	// each row corresponds to the adjacency list for a single node
	this.adjacencyList = [
		[],
		[],
		[],
		[],
		[],
		[],
	];
	// adjacency matrix - used to answer questions
	// rows are indexed by start of edge, columns are indexed by end of edge
	// items are indexed as adjacencyMatrix[from][to]
	this.adjacencyMatrix = [
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
	];
	// This as a quick, cheap way to store each node's neighbors.
	// I'm using an object as a dictionary of lists, where each
	// list contains all the nodes that could connect to the index
	// node
	var neighborDict = {
		A:['B', 'D', 'E'],
		B:['A', 'C', 'D', 'E', 'F'],
		C:['B', 'E', 'F'],
		D:['A', 'B', 'E'],
		E:['A', 'B', 'C', 'D', 'F'],
		F:['B', 'C', 'E'],
	};
	// create nodes and edges
	for (var startNodeID in neighborDict) {
		// add the node to our list of nodes
		this.addNodeToGraph(startNodeID);
		// choose some number of neighbors to remove (remove at least one, keep at least one)
		var removeCount = getRandomInt(1, neighborDict[startNodeID].length);
		// randomly choose that many nodes to remove
		for (var count = 0; count < removeCount; count++) {
			// pick a random index
			index = getRandomInt(0, neighborDict[startNodeID].length);
			// pull that item out of the array
			neighborDict[startNodeID].splice(index, 1);
		}
		// create an edge for all the nodes remaining in the neighbors array
		for (var i=0; i < neighborDict[startNodeID].length; i++) {
			if (this.get('weighted') == 'false') {
				// we use 0 to indicate that there is no cost for this edge
				var randCost = 0;
				// set the flag so we don't show the cost
				var showCost = false;
			} else {
				// if there is already an edge between these two nodes
				if (this.findEdge(neighborDict[startNodeID][i], startNodeID) >= 0) {
					//  use the same cost for both edges
					var randCost = this.findEdgeCost(neighborDict[startNodeID][i], startNodeID);
					// we will draw the cost for the "partner" to this edge - this way
					// the cost is only drawn once
					var showCost = false;
				// if there isn't already an edge between these two nodes,
				} else {
					// pick a random cost for the edge
					var randCost = getRandomInt(1, 10);
					// make sure we do show the cost
					var showCost = true;
				}
			}
			// add the edge and its cost to the graph model
			this.addEdgeToGraph(startNodeID, neighborDict[startNodeID][i], randCost, showCost);
			// if this is an undirected graph, then add an edge in the other direction
			if (this.get('undirected') == 'true') {
				// add the "opposite" edge and its cost to the graph model
				this.addEdgeToGraph(neighborDict[startNodeID][i], startNodeID, randCost, false);
			}
		}
	}
	console.log(this.adjacencyList);
}

/*
 * Create a new set of question templateString
 */
GraphModel.prototype.createNewQuestions = function() {
	// Each question template is an array holding either strings
  // or executable commands stored as strings.
  this.questions = [
 	 ["Fill in the adjacency matrix"],
 	 ["Fill in the adjacency list"],
  ];
  // the question index is used to rotate through the questions
  this.questionIndex = 0;
	// the answer(s) is/are stored in an array
	this.answers = [];
	// the actual question is stored in a string
	this.question = '';
}


/*
 * choose a random template and useit to construct a new question string
 */
GraphModel.prototype.chooseQuestion = function() {
	// choose a question index at random
	this.questionIndex = getRandomInt(this.get('firstQuestion'), this.get('lastQuestion') + 1);
	// get the corresponding question template
	var questionTemplate = this.questions[this.questionIndex];
	// start with an empty question string
	this.question = "";
	// loop through every line of the template
	for (index = 0; index < questionTemplate.length; index++) {
		// get the next line of the template
		var templateString = questionTemplate[index];
		// add it to the question string
		this.question = this.question + templateString;
	}
}


/*
 * This function returns the index of a tree node based on its ID
 */
GraphModel.prototype.findNode = function(nodeID) {
	// loop through nodes in tree
	for	(var index = 0; index < this.nodes.length; index++) {
		// check whether the current nodeID is the target nodeID
	    if (this.nodes[index].nodeID == nodeID)
	    	// return the index of the target nodeID within the
	    	// node array
	    	return index;
	}
	// return -1 to indicate that the nodeID wasn't found
	return -1;
}


/*
 * This function returns the index of an edge based on its
 * fromNodeID and toNodeID
 */
GraphModel.prototype.findEdge = function(fromNodeID, toNodeID) {
	// loop through edges in tree
	for	(var index = 0; index < this.edges.length; index++) {
		// check whether the current nodeID is the target nodeID
	    if (this.edges[index].fromNodeID == fromNodeID &&
	    	this.edges[index].toNodeID == toNodeID)
	    	// return the index of the target nodeID within the
	    	// node array
	    	return index;
	}
	// return -1 to indicate that the nodeID wasn't found
	return -1;
}


/*
 * This function returns the cost of an edge based on its
 * fromNodeID and toNodeID
 */
GraphModel.prototype.findEdgeCost = function(fromNodeID, toNodeID) {
	// loop through edges in tree
	for	(var index = 0; index < this.edges.length; index++) {
		// check whether the current nodeID is the target nodeID
	    if (this.edges[index].fromNodeID == fromNodeID &&
	    	this.edges[index].toNodeID == toNodeID)
	    	// return the index of the target nodeID within the
	    	// node array
	    	return this.edges[index].cost;
	}
	// return -1 to indicate that the nodeID wasn't found
	return -1;
}


/*
 * This function is used to add a node to the nodes array
 */
GraphModel.prototype.addNodeToGraph = function(nodeID) {
	// does the node already exist?
	if (this.findNode(nodeID) >= 0) return;
	// Create a GraphNode object
	var newGraphNode = new GraphNode(nodeID);
	// Add GraphNode object to end of array of nodes
	this.nodes.push(newGraphNode);
}

function addInOrder(arr, item) {
	if (arr.length == 0) {
		arr.push(item);
		return;
	}
	for (var i = arr.length - 1; i >= 0; i--) {
		if (item.charCodeAt(0) > arr[i].charCodeAt(0)) {
			arr.splice(i+1, 0, item);
			return;
		}
	}
	arr.unshift(item);
	return;
}

/*
 * This function is used to add an edge to the edges array
 */
GraphModel.prototype.addEdgeToGraph = function(fromNodeID, toNodeID, cost, showCost) {
	// are the from and to nodes the same?
	if (fromNodeID == toNodeID) return;
	// Is cost > 0?
	if (cost < 0) return;
	// does the edge already exist?
	if (this.findEdge(fromNodeID, toNodeID) >= 0) return;
	// Create a GraphEdge object
	var newGraphEdge = new GraphEdge(fromNodeID, toNodeID, cost, showCost);
	// Add GraphEdge object to array of edges
	this.edges.push(newGraphEdge);
	// add edge to the adjacency list
	// this.adjacencyList[fromNodeID.charCodeAt(0) - 'A'.charCodeAt()].push(toNodeID);
	addInOrder(this.adjacencyList[fromNodeID.charCodeAt(0) - 'A'.charCodeAt()], toNodeID);
	// add edge to the adjacency matrix
	if (this.get('weighted') == 'true')
		this.adjacencyMatrix[fromNodeID.charCodeAt(0) - 'A'.charCodeAt()][toNodeID.charCodeAt(0) - 'A'.charCodeAt()] = cost;
	else
		this.adjacencyMatrix[fromNodeID.charCodeAt(0) - 'A'.charCodeAt()][toNodeID.charCodeAt(0) - 'A'.charCodeAt()] = 1;
}


/*
 * This function dumps the contents of the node array in no particular
 * order.
 */
GraphModel.prototype.dumpGraph = function() {
	// loop through the nodes array
	for	(var index = 0; index < this.nodes.length; index++) {
		// print out ID of each node
		console.log("Index: " + index + " ID: " + this.nodes[index].nodeID);
	}
	// loop through the edges array
	for	(var index = 0; index < this.edges.length; index++) {
		// print out details about each edge
		console.log("Index: " + index + " fromID: " + this.edges[index].fromNodeID
						+ " toID: " + this.edges[index].toNodeID);

	}
}

/*
 * This function is used to answer questions about a graph's cardinality
 * i.e., how many edges are in the graph
 */
GraphModel.prototype.cardinality = function() {
	if (this.get('undirected') == 'true') {
		return this.edges.length / 2;
	} else {
		return this.edges.length;
	}
}

/*
 * These functions count how many edges a given node has
 */
GraphModel.prototype.degree = function(node) {
	var counter = 0;
	// if this is an undirected graph, count each edge once
	if (this.get('undirected') == 'true') {
		//	loop through the node array
		for (var i in this.nodes){
			// is there an egde between the given node and the node in the array?
			if (this.findEdge(node.nodeID, this.nodes[i].nodeID) != -1) {
			 	// count it
				counter += 1;
			}
		}
		// divide by two, because we count each node twice
		return counter;
	// if this is a directed graph, add up the in and out degrees
	} else {
		return this.inDegree(node) + this.outDegree(node);
	}
}


GraphModel.prototype.inDegree = function(node){
	var counter = 0;
	//	loop through the node array
	for (var i in this.nodes){
		// is there an edge to the given node from the node in the array?
		if (this.findEdge(this.nodes[i].nodeID, node.nodeID) != -1) {
		 	// count it
			counter += 1;
		}
	}
	return counter;
}


GraphModel.prototype.outDegree = function(node){
	var counter = 0;
	//	loop through the node array
	for (var i in this.nodes){
		// is there an egde from the given node to the node in the array?
		if (this.findEdge(node.nodeID, this.nodes[i].nodeID) != -1) {
		 	// count it
			counter += 1;
		}
	}
	return counter;
}


/*
 * This function returns a list of all the nodes in the graph.
 */
GraphModel.prototype.nodeList = function() {
	// create empty array to store list
	var nodeList = [];
	// loop through the nodes array
	for	(var index = 0; index < this.nodes.length; index++) {
		// add nodeID to path
		nodeList[nodeList.length] = this.nodes[index].nodeID;
	}
	// return list of nodes
	return nodeList;
}


/*
 * This function returns a list of all nodes with degree >= 1
 */
GraphModel.prototype.connectedNodeList = function() {
	// create empty array to store list
	var nodeList = [];
	// loop through the nodes array
	for	(var index = 0; index < this.nodes.length; index++) {
		if (this.degree(this.nodes[index]) > 0)
			// add nodeID to list
			nodeList[nodeList.length] = this.nodes[index].nodeID;
	}
	// return list of nodes
	return nodeList;
}
