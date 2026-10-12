var DiagramCompiler = Class.create();
DiagramCompiler.prototype = {
	initialize: function(diagramInstance, log) {
		this.log_on = log;
		if (typeof diagramInstance == 'string') {
			this.diagramInstanceGR = new DiagramBuilderInstance().getById(diagramInstance);
		} else {
			this.diagramInstanceGR = diagramInstance;
		}
		this.diagram = JSON.parse(this.diagramInstanceGR.diagram_json.toString());
	},
	/**
    * process:
    *   - When extending this script include, overwrite this method
    */
	process: function() {
	},
	/**
    * compile:
    *   - When extending this script include, overwrite this method
    */
	compile:function() { 
	},
	/**
     * getName: 
     *   - Retch the diagram instance glide reocrd name
     * @returns {string}
     */
	getName: function() {
		return this.diagramInstanceGR.name.toString();
	},
	/**
     * getDescription: 
     *   - Returns the diagram description
     * @returns {string}
     */
	getDescription: function() {
		return this.diagram.description == "" ? false : this.diagram.description;
	},
	/**
    * getVariables:
    *   - Returns the variable object that is stored in the diagram instance json
    * @returns {object}
    */
	getVariables: function() {
		return this.diagram.variables;
	},
	/**
    * getArguments:
    *   - Returns the node_arguments object that is stored in the diagram instance json
    * @returns {object}
    */
	getArguments: function() {
		return this.diagram.node_arguments;
	},
	/**
    * getNodes:
    *   - Returns the nodes object that is stored in the diagram instance json
    * @returns {object}
    */
	getNodes: function() {
		return this.diagram.nodes;
	},
	/**
    * getDiagramJSON:
    *   - Returns the diagram_json object that is stored in the diagram instance
    * @returns {object}
    */
	getDiagramJSON: function() {
		return this.diagram;
	},
	/**
    * iterateEdges:
    *   - Iterates over the edge object of the diagram instance, each iteration will call the callback function
    * @param {function}
    */
	iterateEdges: function(callback) {
		var that = this;
		var steps = [];
		var startKey = that.findTerminalKey('start');
		var endKey = that.findTerminalKey('end');
		var currentEdges = that.diagram.edges.filter(function(edge){
			return edge.from == startKey;
		});
		try {
			while (currentEdges.length != 0){
				currentEdges.forEach(callback);
				currentEdges = that.diagram.edges.filter(function(edge){
					for(var i = 0; i != currentEdges.length; i++){
						var currentEdge = currentEdges[i];
						if(edge.from == currentEdge.to){
							return true;
						}
					}
					return false;
				});
			}
		} catch (e) {
			that.errorJSON({
				error: e,
				currentEdge: currentEdge,
				diagram: that.diagram
			});
		}
	},
	/**
    * findTerminalKey:
    *   -Returns the start or end key of a diagram
    * @param {string} terminal - 'start' or 'end'
    * @param {string} groupKey - the key for the grouping
    * @returns {string}
    */
	findTerminalKey: function(terminal, groupKey) {
		//TODO
		//isGroup -> is_group
		groupKey = groupKey !== undefined ? groupKey : false;
		var searchKey = terminal == 'start' ? 'to' : 'from';
		var existKey = terminal == 'start' ? 'from' : 'to';
		var that = this;
		var nodes = that.diagram.nodes.filter(function(node){
			var group = node.group !== undefined ? node.group : false;
			return group == groupKey;
		});
		for(var index = 0; index !== nodes.length; index++){
			var node = nodes[index];
			var key = node.key;
			var filtered = 0;
			var exist = 0;
			that.diagram.edges.forEach(function(edge){
				filtered = filtered + (edge[searchKey] == key ? 1 : 0);
				exist = exist + (edge[existKey] == key ? 1 : 0);
			});
			if (filtered == 0 && exist >= 1) {
				return key;
			}
		}
		return false;
	},
	/**
    * getActionDefinition:
    *   - Returns a gliderecord for the action definition
    * @param {string} diagramActionId - Action Definiton sys_id
    * @returns {GlideRecord}
    */
	getActionDefinition: function(diagramActionId) {
		var diagramActionGr = DiagramBuilderDiagramAction.getDiagramActionById(diagramActionId);
		return diagramActionGr;
	},
	/**
    * getActionArgument:
    *   - Returns a gliderecord for the action argument
    * @param {string} actionArgumentSysId - action argument record sys_id
    * @returns {GlideRecord}
    */
	getActionArgument: function(actionArgumentSysId) {
		var actionArgumentGR = DiagramActionArguments.getActionArgumentsById(actionArgumentSysId);
		return actionArgumentGR;
	},
	/**
    * getActionOutcome:
    *   - Returns a gliderecord for the action outocme
    * @param {string} actionOutcomeSysId - action outcome record sys_id
    * @returns {GlideRecord}
    */
	getActionOutcome: function(actionOutcomeSysId) {
		//TODO
		//UNSURE IF THIS IS EVEN NEEDED
		var actionOutcomeGR = new GlideRecord(BuilderConstants.BUILDER_DIAGRAM_ACTION_OUTCOME);
		if (actionOutcomeGR.get(actionOutcomeSysId)) {
			return actionOutcomeGR;
		}
		return false;
	},
	/**
    * getActionDefinitionArguments:
    *   - Returns the gliderecord query of arguments for the action definition
    * @param {GlideRecord} actionDefinitionGR
    * @returns {GlideRecord Query}
    */
	getActionDefinitionArguments: function(actionDefinitionID) {
		var actionArgumentsGR = DiagramActionArguments.getArgumentsByActionId(actionDefinitionID);
		return actionArgumentsGR;
	},
	getActionDefinitionArgumentsWithDirection: function(actionDefinitionID, direction) {
		var actionArgumentsGR = 	DiagramActionArguments.getArgumentsByActionIdWithDirection(actionDefinitionID, direction);
		return actionArgumentsGR;
	},
	/**
    * getArgumentValue:
    *   - Returns a value for the current argument
    * @param {string} value
    * @param {string} argumentGlideRecordName - defaults to "argumentGR"
    * @returns {GlideRecord}
    */
	getArgumentValue: function(value, argumentGlideRecordName) {
		argumentGlideRecordName = argumentGlideRecordName || "argumentGR";
		try {
			var valueType = typeof value;
			if (valueType == 'string') {
				var regex = this.getArgumentRegexPattern();
				///\{\{(.*)\.([a-zA-Z0-9]{32})\}\}/;
				//var regex = /\{\{([a-zA-Z0-9]*)\.(.*)\}\}/;
				var regexResults;
				while ((regexResults = regex.exec(value)) !== null) {
					if (regexResults.index === regex.lastIndex) {
						regex.lastIndex++;
					}

					var temps = this.diagram[regexResults[1]].filter(function(t) {
						return t.key == regexResults[2];
					});
					if (temps.length != 0) {
						var temp = temps[0];
						if (temp) {
							var replaceString = "";
							replaceString += temp.node ? temp.node + "." : "";
							replaceString += (temp.name || temp[argumentGlideRecordName].name.toString());
							value = value.replace(regexResults[0], replaceString);
						}
					}
				}
			}
		} catch (e) {
			this.errorJSON({
				error: e,
				value: value,
				diagram: this.diagram
			});
		}
		return value;
	},
	getArgumentRegexPattern: function(){
		return 	/\{\{(node_arguments|variables)\.([a-zA-Z0-9-.]{32,73})\}\}/g;
	},
	log: function(str) {
		if (this.log_on) {
			gs.info(str);
		}
	},
	logJSON: function(obj) {
		this.log(JSON.stringify(obj, null, 4));
	},
	errorJSON: function(obj) {
		gs.error(JSON.stringify(obj, null, 4));
	},
	type: 'DiagramCompiler'
};
