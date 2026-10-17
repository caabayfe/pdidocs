var num = 2; //so page opens up to the ops by flow component tree view

$j(document).ready(function() {
	$j('.tree-button').click(function() {
		num = $j(this).attr('target');
		$j(this).prop('disabled', true);
		$j('.tree-button').not('#button' + num).prop('disabled', false);
		$j('.tree-div').not('#div' + num).hide();
		$j('#div' + num).toggle();
  });
});

var trees = {};
trees["tree" + 1] = null;
trees["tree" + 2] = null;
trees["tree" + 3] = null;

function start() {
	getData("", "tree1", 1);
	getData("ordered/", "tree2", 2);
	var div2 = gel("div2");
	var button2 = gel("button2");
	div2.style.display = "block";
	button2.disabled = true; 
}

/*constants*/
var NOT_READY = "\"NOT_READY\"";
var READY = "\"READY\"";
var QUEUED = "\"QUEUED\"";
var COMPLETE = "\"COMPLETE\"";
var ERROR = "\"ERROR\"";

var OP_CLASS = "\"opClass\"";
var ID = "\"id\"";
var STATE = "\"state\"";
var ERROR_TITLE = "\"error\"";

var COLOR_GREEN = "#D5FED0";
var COLOR_GRAY = "#D8D8D7";
var COLOR_RED = "#FED0D0";
var COLOR_ORANGE = "#fce0b3";

var error = false; 
var errorList = [];
var errorMessageMap = {};
var ul = document.getElementById("error-list");
var errorCount = 1; 

function colorComponents() {
	var components = document.querySelectorAll("#tree2 > ul > li > div > div > ul > li");
	
	//states come from operations/util/flowstate.js in glide-flow-designer
	var stateMap = new Map ([
		["COMPLETE\"", COLOR_GREEN],
		["INCOMPLETE\"", COLOR_GRAY],
		["NOT_READY\"", COLOR_GRAY],
		["ERROR\"", COLOR_RED],
		["WAITING\"", COLOR_ORANGE],
		["IN_PROGRESS\"", COLOR_ORANGE],
		["NOT_RUN\"", COLOR_GRAY],
		["CANCELLED\"", COLOR_ORANGE]
	]
	);
	
	for (var i = 0; i < components.length; i++) {
		reLabelOps(components[i], i, components.length);
		var componentLabel = components[i].querySelector("span.jsontree_label-wrapper > span.jsontree_label");
		
		if (error) {
			componentLabel.style.backgroundColor = COLOR_RED;
			error = false; 
		} else if (i != 0 || i < components.length - 2) { 
			//actual component nodes, excluding first and last 2 nodes bc they're not components
			var componentLabelText = componentLabel.innerText;
			var labelArr = componentLabelText.split("- ");
			var state = labelArr[labelArr.length-1];

			var color = stateMap.get(state);
			componentLabel.style.backgroundColor = color;
		}
	}
}

function reLabelOps(component, index, len) {
	var opsList = component.querySelector("div > div > ul").children;
	
	var componentLabel = component.querySelector("span.jsontree_label-wrapper > span.jsontree_label");
	var componentLabelText = componentLabel.innerText;
	
	//states from OpState.java
	var stateMap = new Map ([
		[COMPLETE, COLOR_GREEN],
		[NOT_READY, COLOR_GRAY],
		[ERROR, COLOR_RED],
		[QUEUED, COLOR_ORANGE],
		[READY, COLOR_ORANGE]
	]
	);
	
	for (var j = 0; j < opsList.length; j++) {
		var op = opsList[j];
		var opLabel = op.querySelector("span.jsontree_label-wrapper > span.jsontree_label");
		var opNodes = (op.querySelector("div > div > ul > li > div > div > ul")).children;

		var opClass;
		var id; 
		var newOpLabel; 
		var errorMessage;

		for (var i = 0; i < opNodes.length; i++) {
			var nodeLabel = (opNodes[i].querySelector("span.jsontree_label-wrapper > span.jsontree_label")).innerText;

			var nodeValue = null;
			if (opNodes[i].querySelector("span.jsontree_value-wrapper > span.jsontree_value") != null) {
				nodeValue = (opNodes[i].querySelector("span.jsontree_value-wrapper > span.jsontree_value")).innerText;
			}
			
			if (nodeLabel === OP_CLASS) { //innerText value has two sets of quotes, ex: ""opClass"" 
				var valueArr = nodeValue.split('.');
				opClass = valueArr[valueArr.length-1];
				opClass = opClass.substring(0, opClass.length-1); //without quotes
				newOpLabel = opClass;
			} else if (nodeLabel === ID) {
				id = nodeValue.substring(1, nodeValue.length-1);
				newOpLabel += " - " + id;
			} else if (nodeLabel === ERROR_TITLE && nodeValue != null) {
				errorMessage = nodeValue;
			} else if (nodeLabel === STATE) {
				if (nodeValue === ERROR) {
					error = true;
					errorList.push(op);
					op.setAttribute("id", id);
					errorMessageMap[id] = errorMessage;
					
					var errorMsgLi = document.createElement("li");
					errorMsgLi.textContent = errorCount + ". " + errorMessage;
					
					var errorPathLi = document.createElement("li");
					var SEPARATOR = " > ";
					errorPathLi.textContent = "found at: " + componentLabelText + SEPARATOR + newOpLabel;
				
					errorCount++;
					ul.appendChild(errorMsgLi);
					ul.appendChild(errorPathLi);
				}

				var backgroundColor = stateMap.get(nodeValue);
				opLabel.style.backgroundColor = backgroundColor; 
				if (index == 0 || index >= len - 2) { 
					//for start and end directives and leftover ops since they're not under actual components with a state
					componentLabel.style.backgroundColor = backgroundColor;
				}
			}
		}

		opLabel.childNodes[1].nodeValue = newOpLabel; 
	}
}

function displayErrors() {
	if (errorList.length > 0) {
		ul.style.display = "block";
	}
}

function getParmVal(name) {
    var url = document.URL.parseQuery();
    if(url[name] && isSysId(url[name])) {
        return url[name];
    }
    else {
        throw new Error('Invalid URL parameter');
    }
}

var origin = window.location.origin;

function getData(apiUrlPart, treeId, treeNum) {
	var url = origin + "/api/now/processflow/operations/flow/plan/" + apiUrlPart +  getParmVal('sysparm_context');
	try {
		fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-userToken': window.g_ck
			}
		}).then(function(response) {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();  // Assuming the response is in JSON format
		}).then(function(data) {
			if(this.readyState == this.DONE) {
				var jsonTreeHolder = document.getElementById(treeId);
				trees["tree" + treeNum] = jsonTree.create(data, jsonTreeHolder);
				if (treeId === "tree2") {
					colorComponents();
					displayErrors();
				}
			}
		});
	} catch (ex) {
		console.error(ex);
	}
	
}

function expandAll() {
	trees["tree" + num].expand();
}

function collapseAll() {
	trees["tree" + num].collapse();
}

function isSysId(param) {
    return param.length === 32 && /^[a-zA-Z0-9]+$/.test(param);
}
