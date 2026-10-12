var target = "detailed_view";

$j(document).ready(function () {
	$j('.tree-button').click(function () {
		target = $j(this).attr('target');
		$j(this).prop('disabled', true);
		$j('.tree-button').not('#button-' + target).prop('disabled', false);
		$j('.tree-div').not('#div-' + target).hide();
		$j('#div-' + target).toggle();
		if ($j(this).attr('id') == 'button-runtime_values') {
			document.getElementById('runtime_values').innerHTML = "";
			trees["tree-runtime_values"] = jsonTree.create(runtimeValues, document.getElementById('runtime_values'));
		}
	});
});

var trees = {};
var runtimeValues = {};
trees["tree-detailed_view"] = null;
trees["tree-compiled_flow"] = null;
trees["tree-runtime_state"] = null;
trees["tree-runtime_values"] = null;

var stateMap = {
	"COMPLETE": "completed", "QUIESCED": "quiesced", "NOT_READY": "notready", "ERROR": "error",
	"WAITING": "quiesced", "CANCELLED": "notready"
};

function buildFlowStructure(serializedFlowDetail) {
	var componentsObject = buildFlowStructureObject(serializedFlowDetail.compiledFlow.flowStructure,
		serializedFlowDetail.componentHistory);
	var flowStructureRoot = buildFlowStructureTree(componentsObject);
	fillInstructions(flowStructureRoot, serializedFlowDetail.compiledFlow.instructions.instructions);
	var runtimeKeysObj = makeRuntimeKeysObj(serializedFlowDetail.runtimeKeys);
	root = componentInstructionTree(flowStructureRoot, 1, serializedFlowDetail.runtimeState,
		serializedFlowDetail.state, runtimeKeysObj);
	return root;
}

function makeRuntimeKeysObj(keys) {
	var rtKeyObj = {};
	for (var i = 0; i < keys.length; ++i) {
		rtKeyObj[keys[i]] = false;
	}
	return rtKeyObj;
}

function getCursorForComponent(component, cursors) {
	if (!cursors)
		return null;
	var curCursors = [];
	for (var p in cursors) {
		if (cursors[p].location < component.minInstructionId ||
			cursors[p].location > component.maxInstructionId)
			continue;
		else
			curCursors.push(cursors[p]);
	}
	return curCursors;
}

function goToRuntimeCursor(label) {
	trees["tree-runtime_state"].collapse();
	trees["tree-runtime_state"].unmarkAll();
	trees["tree-runtime_state"].findAndHandle(function(node) {
		return node.label == label;
	},
	function(node) {
		document.getElementById('button-runtime_state').click();
		node.expandParent(true);
		node.expand();
		node.mark();
		node.el.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
	});
}

function goToCursorInstruction(index) {
	trees["tree-detailed_view"].findAndHandle(
		function(node) {
			return (typeof node.label == 'string' && (0 < node.label.indexOf('data-index="'+index+'"')));
		},
		function(node) {
			node.expandParent(true);
			node.expand();
			node.el.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
		});
}


function applyStateAndCursor(obj, instIndex) {
	var cursorStlye = '';
	var classes = [];
	if (obj.cursors) {
		for (var i = 0; i < obj.cursors.length; ++i) {
			cursorStlye += '<a class="cursor_name" title="Click to go to cursor state"';
			if (instIndex < 0)
				cursorStlye += ' href="Javascript:goToCursorInstruction(' + obj.cursors[i].location +')">Cursor @ ' + obj.cursors[i].location + '</a>';
			else
				cursorStlye += ' href="Javascript:goToRuntimeCursor(\'' + obj.cursors[i].label +'\')">Go to Cursor &UpperRightArrow;</a>';
		}
	}
	if (obj.state)
		classes.push(stateMap[obj.state]);
	return '<span data-index="'+(instIndex > 0 ? instIndex : "")+'" class="' + classes.join(' ') + '">' + obj.key + '</span>' + cursorStlye;
}

function processRuntimeValues(node, rtValsObj, event) {
	var rtValues = rtValsObj.values;
	if (rtValues.error || rtValues.status == 'failure') {
		jsonTree.addChild("error", rtValues, node);
		var okElem = document.createElement("span");
		okElem.innerHTML = '&#10060';
		event.target.parentNode.replaceChild(okElem, event.target);
		return;
	}
	for (var key in rtValues) {
		var matched = key.match(/.*name=([a-zA-Z0-9._]+)/);
		if (matched && matched.length >= 2) {
			jsonTree.addChild(matched[1], rtValues[key], node);
		}
		runtimeValues[key] = rtValues[key];
	}

	node.expand();
	node.mark();
	okElem = document.createElement("span");
	okElem.innerHTML = '&#9989;';
	if (event.target && event.target.parentNode) {
		event.stopPropagation();
		event.target.parentNode.replaceChild(okElem, event.target);
		okElem.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
	}
}

function getRuntimeValues(event, identifier) {
	var keysToLoad = event.target.getAttribute('data-keys');
	var thisEvent = event;
	var rtValsUrl = window.location.origin + "/api/now/processflow/execution/runtimevalues/" + getParmVal('sysparm_context');
	requestGet(rtValsUrl + '?keysToLoad=' + encodeURIComponent(keysToLoad),
		function (data) {
			if (this.readyState == this.DONE) {
				trees["tree-detailed_view"].findAndHandle(function(node) {
					return (typeof node.label == 'string') && (node.label.indexOf('inst_'+identifier) > 0);
				},
				function (node) {
					var curNode = node;
					processRuntimeValues(curNode, data, thisEvent);
				});
			}
	});
}

function runtimeValuesLink(instId, keys) {
	return '<a class="load_rt_link inst_'+instId+'" href="#"  onclick="getRuntimeValues(event, '+instId+')" data-keys="'+
		keys.join(",")+'">Load</a>';
}

function componentInstructionTree(element, counter, runtimeState, ctxState, runtimeKeysObj) {
	cursors = getCursorForComponent(element, runtimeState ? runtimeState.cursors : null);
	if (counter == 1) {
		element.state = ctxState;
	}
	var componentKey = componentName(counter, element, cursors);
	componentKey = applyStateAndCursor(componentKey, -1);
	var parent = {};
	parent[componentKey] = {};
	if (element.children.length == 0) {
		for (var i = 0; i < element.instructions.length; ++i) {
			var instKey = compactInstructionKey(element.instructions[i], cursors, runtimeKeysObj);
			if (instKey.cursors)
				instKey.key = applyStateAndCursor(instKey, element.instructions[i].id);
			parent[componentKey][instKey.key] = element.instructions[i];
			if (!instKey.runtimeKeys || instKey.runtimeKeys.length == 0)
				continue;
			var rtValsKey = "Runtime values:" + runtimeValuesLink(element.instructions[i].id, instKey.runtimeKeys);
			parent[componentKey][instKey.key][rtValsKey] = {"": ""};
		}
		return parent;
	}

	for (i = 0; i < element.children.length; ++i) {
		var childComp = componentInstructionTree(element.children[i], ++counter, runtimeState, ctxState, runtimeKeysObj);
		var firstKey = Object.keys(childComp)[0];
		parent[componentKey][firstKey] = childComp[firstKey];
	}
	return parent;
}

function componentName(counter, element, cursors) {
	var key = counter + ". " + element.sourceName + " (" + element.sourceAlias + " - " + element.sourceId + ")";
	if (element.parentLoops)
		key = key + "[" + element.parentLoops + "]";
	return {
		key: key,
		state: element.state,
		cursors: cursors
	};
}

function fillInstructions(component, instructions) {
	if (component.children.length == 0) {
		for (var i = 0; i < instructions.length; ++i) {
			currInstId = instructions[i].id;
			if (currInstId >= component.minInstructionId && currInstId <= component.maxInstructionId)
				component.instructions.push(instructions[i]);
		}
		return;
	}
	for (i = 0; i < component.children.length; ++i) {
		fillInstructions(component.children[i], instructions);
	}
}

function resolveAttributes(instruction, attrValue, runtimeKeysObj, keys) {
	if (typeof attrValue == 'string' && runtimeKeysObj.hasOwnProperty(attrValue)) {
		keys.push(attrValue);
	}
	else if (typeof attrValue == 'object') {
		for (var p in attrValue) {
			resolveAttributes(instruction, attrValue[p], runtimeKeysObj, keys);
		}
	}
}

function resolveRuntimeKeys(instruction, runtimeKeysObj, keys) {
	for (var p in instruction)
		resolveAttributes(instruction, instruction[p], runtimeKeysObj, keys);
}

function compactInstructionKey(instruction, cursors, runtimeKeysObj) {
	var curCursor = null;
	var keys = [];
	resolveRuntimeKeys(instruction, runtimeKeysObj, keys);
	if (cursors) {
		for (var i = 0; i < cursors.length; ++i) {
			if (cursors[i].location == instruction.id) {
				curCursor = cursors[i];
				break;
			}
		}
	}
	return {
		key: instruction.id + ". " + instruction["@class"],
		cursors: (curCursor ? [curCursor] : null),
		runtimeKeys: keys
	};
}

function buildFlowStructureTree(componentsObject) {
	var root = null;
	for (var p in componentsObject) {
		if (componentsObject[p].type == 'STEP')
			continue;
		if (componentsObject[p].parentSourceAlias == null) {
			root = componentsObject[p];
		}

		for (var q in componentsObject) {
			if (componentsObject[q].type == 'STEP')
				continue;
			if (componentsObject[q].parentSourceAlias == componentsObject[p].sourceAlias) {
				componentsObject[p].children.push(componentsObject[q]);
				componentsObject[p].children = componentsObject[p].children.sort(
					function (comp1, comp2) {
						return comp1.maxInstructionId - comp2.maxInstructionId;
					});
			}
		}
		if (p != "root")
			delete componentsObject[p];
	}
	return root;
}

function buildFlowStructureObject(flowStructure, componentHistory) {
	var componentsObject = {};
	var flowElements = flowStructure.flowElements;
	for (var i = 0; i < flowElements.length; ++i) {
		componentsObject[flowElements[i].sourceAlias] = flowElements[i];
		componentsObject[flowElements[i].sourceAlias].children = [];
		componentsObject[flowElements[i].sourceAlias].instructions = [];
	}
	if (!componentHistory)
		return;
	for (i = 0; i < componentHistory.length; ++i) {
		componentsObject[componentHistory[i].componentAlias].state = componentHistory[i].state;
		if (componentHistory[i].parentLoops)
			componentsObject[componentHistory[i].componentAlias].parentLoops = componentHistory[i].parentLoops;
	}
	return componentsObject;
}

function getParmVal(name) {
	var url = document.URL.parseQuery();
	if (url[name] && isSysId(url[name])) {
		return url[name];
	}
	else {
		throw new Error('Invalid URL parameter');
	}
}

function renderFlowExecutionTreeViews(response) {
	if (response.error || response.status == 'failure') {
		trees["tree-detailed_view"] = jsonTree.create(response, document.getElementById('detailed_view'));
		showDefaults();
		return;
	}
	trees["tree-compiled_flow"] = jsonTree.create(response.compiledFlow, document.getElementById('compiled_flow'));
	var runtimeState = response.runtimeState ? response.runtimeState : {};
	trees["tree-runtime_state"] = jsonTree.create(runtimeState, document.getElementById('runtime_state'));
	try {
		var flowStructureRoot = buildFlowStructure(response);
		trees["tree-detailed_view"] = jsonTree.create(flowStructureRoot, document.getElementById('detailed_view'));
	} catch (ex) {
		if (console) {
			console.error(ex);
		}
	}
	showDefaults();
}

function showDefaults() {
	var detailed_view = gel("div-detailed_view");
	var detailed_view_button = gel("button-detailed_view");
	detailed_view.style.display = "block";
	detailed_view_button.disabled = true;
}

function expandAll() {
	trees["tree-" + target].expand();
}

function collapseAll() {
	trees["tree-" + target].collapse();
}

function start() {
	requestGet(window.location.origin + "/api/now/processflow/execution/state/" + getParmVal('sysparm_context'),
		function (data) {
			if (this.readyState == this.DONE) {
				renderFlowExecutionTreeViews(data);
			}
	});
}

function requestGet(getUrl, handler) {
	try {
		fetch(getUrl, {
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
			handler(data);  // Call the handler function with the received data
		});

	} catch (ex) {
		console.error(ex);
	}

}

function isSysId(param) {
    return param.length === 32 && /^[a-zA-Z0-9]+$/.test(param);
}
