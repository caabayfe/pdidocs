var SNHelpGuidanceStepController = Class.create();
SNHelpGuidanceStepController.prototype = {
	
    initialize: function() {
		
		this._helpConstants = new SNHelpConstantProvider();
		this._dbCtrl = new SNHelpDBController(this._helpConstants.tables.guidance_step);
		this._contentCtrl = new SNHelpContentController();
		this._helpUtil = new SNHelpUtil();
    },
	
    getSteps: function(sys_id, type) {
		
		var steps;
		var query;
		var stepFields, contentFields, content, isSetup;
		var orderBy =  this._helpConstants.tableColumns.order;
		if (!sys_id) {
			this._helpUtil.setError(this.type,this._helpConstants.errorMessages.empty_sys_id);
			return null;
		}
		
		query = this._helpConstants.tableColumns.guidance + "=" + sys_id;
		
		
		if(type === this._helpConstants.setupType.GLOBAL_SETUP || type === this._helpConstants.setupType.PERSONAL_SETUP) {
			isSetup = true;
			stepFields = this._helpConstants.restAPIKeys.setupStep;
			contentFields = this._helpConstants.restAPIKeys.setupContent;
			// for setup - Only include steps with parent null (Immediate steps)
			query += "^parent=NULL";
		}
		
		steps = this._dbCtrl.getByEncodedQuery(query, orderBy, stepFields);
		
		if (!steps) {
			this._helpUtil.setError(this.type, this._helpConstants.errorMessages.no_records, sys_id);
			return null; 
		}
			
		
		for (var i= 0; i< steps.length; i++) {
			content = this._contentCtrl.getContent(steps[i].sys_id, steps[i].layout, contentFields) || {};
			if(isSetup && Array.isArray(content) && content.length > 0) {
				steps[i].content = content[0];
				
				if(steps[i].content.related_content)
					steps[i].content.related_content = this._contentCtrl.getRelatedContent(steps[i].content.related_content);
			} else {
				steps[i].content = 	content;
			}
		}
		
		return steps;
	},
	
	/**
		Return a step for given sys_id
		@param : step sys_id
		@returns : Single guidance step for given sys_id	
	*/
	getSetupStep : function(sys_id) {
		var step, content;
		
		if (!sys_id) {
			this._helpUtil.setError(this.type,this._helpConstants.errorMessages.empty_sys_id);
			return null;
		}
		
		step = this._dbCtrl.getById(sys_id, this._helpConstants.restAPIKeys.setupStep);
		
		if(step) {
			content = this._contentCtrl.getContent(step.sys_id, step.layout, this._helpConstants.restAPIKeys.setupContent) || {};
			if(Array.isArray(content) && content.length > 0) {
				step.content = content[0];
				
				if(step.content.related_content)
					step.content.related_content = this._contentCtrl.getRelatedContent(step.content.related_content);
			} else {
				step.content = content;
			}
		}
		return step;
	},
	
	/**
		Returns all the child steps(Groups or tasks) for given step of type group
		@param : step id
		@returns : Array of steps or Empty Array
	*/
	
	getSetupSteps: function(step_id) {
		var steps = this._dbCtrl.getByEncodedQuery("parent=" + step_id,  this._helpConstants.tableColumns.order, ["sys_id", "name", "parent", "guidance"]);
		
		return Array.isArray(steps) ? steps : [];
	},
	
    type: 'SNHelpGuidanceStepController'
};
