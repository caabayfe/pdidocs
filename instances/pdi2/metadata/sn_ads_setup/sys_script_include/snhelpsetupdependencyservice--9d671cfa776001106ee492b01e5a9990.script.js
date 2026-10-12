var SNHelpSetupDependencyService = Class.create();
SNHelpSetupDependencyService.prototype = {
    initialize: function() {
		var helpService = new global.SNHelpService();
		this.gsc = helpService.helpGuidanceStep;
		this.constants = new sn_ads_setup.SNHelpSetupConstantProvider();
    },
	
	/*
		Get Dependency records count
		@param sys_id
		@return row count
	*/
	
	getDependencyCount: function(sys_id){
		var gr;
		gr = new GlideRecord(this.constants.tables.setup_dependency);
		gr.addQuery("sys_id", sys_id);
		gr.query();
		return gr.getRowCount();
	},
	
	/*
		deletes a dependency
		@param sys_id
		@return true/flase
	*/
	
	deleteDependency: function(sysId){
		var gr; 
		gr = new GlideRecord(this.constants.tables.setup_dependency);
		gr.addQuery("sys_id", sysId);
		gr.query();
		if(gr.next()){
			return gr.deleteRecord();
		}
		return false;
	},
	
	
	/*
		delete Dependency record
		@param sys_id
		@param step_id
		@return true/fasle 
	*/
	
	deleteM2MDependency: function(sysId, stepId){
		var gr, query='', rows, dependency=false;
		
		if(stepId !== "-1")
			query = "guidance_step="+stepId;
		else
			query = "sys_id="+sysId;
		
		gr = new GlideRecord(this.constants.tables.m2m_step_dependency);
		gr.addEncodedQuery(query);
		gr.query();
		while(gr.next()){
			rows = this.getDependencyCount(gr.getValue('setup_dependency'));
			if(rows > 1){
				gs.log("Guided Setup: More than one dependency exists, dependency not deleted");
			}else{
				if(this.deleteDependency(gr.getValue('setup_dependency')))
					dependency = gr.deleteRecord();
			}
				
		}
		return dependency; 
	},
	
	/*
		create Dependency record
		@param params   {dependent_on_plugins: , name:'' , dependent_on_steps: ''}
		@return sys_id of dependency 
	*/
	
	createDependency: function(params, stepName){
		var dbController;
		if(!params.name)
			params.name = gs.getMessage('Dependency: {0}', stepName);
		dbController = new global.SNHelpDBController(this.constants.tables.setup_dependency);
		return dbController.create(params);
		
	},
	
	/*
		create m2m Dependency record
		@param params   {guidance_step: '', setup_dependency : ''}
		@return sys_id of dependency 
	*/
	
	createM2MDependency: function(params){
		var dbController, m2mDependencies;
		dbController = new global.SNHelpDBController(this.constants.tables.m2m_step_dependency);
		return dbController.create(params);
	},
	
	/*
		update Dependency record
		@param params   {dependent_on_plugins: , name:'' , dependent_on_steps: ''}
		@return sys_id of dependency 
	*/
	
	updateDependency: function(sys_id, params){
		var dbController;
		dbController = new global.SNHelpDBController(this.constants.tables.setup_dependency);
		return dbController.update(sys_id, params);
		
	},
	
	/*
		update m2m Dependency record
		@param params   {guidance_step: '', setup_dependency : ''}
		@return sys_id of dependency 
	*/
	
	updateM2MDependency: function(sys_id, params){
		var dbController;
		dbController = new global.SNHelpDBController(this.constants.tables.m2m_step_dependency);
		return dbController.update(sys_id, params);
	},
	
	/*
		get Dependency record
		@param sys_id
		@return dependency record
	*/
	
	getDependencyDetails: function(sys_id){
		var dbController, dependencies;
		if(!sys_id)
			return null; 
		
		dbController = new global.SNHelpDBController(this.constants.tables.setup_dependency);
		return dbController.getById(sys_id);
	},
	
	/*
		get M2M Dependency record
		@param sys_id
		@return dependency record
	*/
	
	getM2MDependency: function(step_id, dependency_id){
		var dbController, query;

		if(step_id)
			query = 'guidance_step=' + step_id;
		else if(dependency_id)
			query = 'sys_id=' + dependency_id;

		dbController = new global.SNHelpDBController(this.constants.tables.m2m_step_dependency);
		return dbController.getByEncodedQuery(query, 'sys_updated_on', ['sys_id', 'guidance_step', 'setup_dependency']);
	},
	
	/*
		get dependency step details 
		@param string of step ids with comma separated  
		@return array of steps 
	*/
	
	getDependencySteps: function(steps){
		var results = [], result = {}, stepDetails, self; 
		
		if(typeof(steps) == 'string')
			steps = steps.split(",");
		
		if(Array.isArray(steps) && steps.length > 0){
			self = this;
			steps.forEach(function(step){
				if(step){
					result = {};
					stepDetails = self.gsc.getSetupStep(step);
					result.sys_id = stepDetails.sys_id;
					result.name = stepDetails.name;
					result.parent = stepDetails.parent;
					result.type = stepDetails.type;
					results.push(result);	
				} 
				
			});
		}
		return results; 
	},
	
	getFormattedDependency: function(dependency){
		var stepDetails, dependencyDetails, dependencySteps;
		stepDetails = this.gsc.getSetupStep(dependency.guidance_step);
		dependencyDetails = this.getDependencyDetails(dependency.setup_dependency); 
		dependencySteps = this.getDependencySteps(dependencyDetails.dependent_on_steps);
		return {step:{sys_id: stepDetails.sys_id, name: stepDetails.name}, dependency: dependencySteps,  m2mId: dependency.sys_id}; 
	},
	/**
	* Handle dependency conflict while reordering tasks/steps
	* @param {string} stepId - sys_id of task, category being reordered
	* @param {string} type - step type - task or category
	* @param {number} prevOrder - prev order of the step being reordered
	* @param {string} prevCateogryId - sys_id of task's prev category if type is task(activity)
	*/
	handleDependencyConflict: function(stepId, type, prevOrder, prevCateogryId) {
		if(type == "group")
			this.handleCategoryDependencies(stepId, prevOrder);
		else
			this.handleTaskDepencies(stepId, prevOrder, prevCateogryId);
	},

	/**
	* Handle dependency conflict on tasks recorder
	*/
	handleTaskDepencies : function(stepId, prevOrder, prevCateogryId) {
		var currentOrder, prevCateogry, prevCateogryOrder, stepParentOrder;
		var step = this.getStepDetails(stepId);

		if(!step)
			return;

		if(step.parent != prevCateogryId)
			prevCateogry = this.getStepDetails(prevCateogryId);

		currentOrder = parseInt(step.order);
		prevCateogryOrder = prevCateogry && parseInt(prevCateogry.order);
		prevOrder = parseInt(prevOrder);
		stepParentOrder = parseInt(step.parentOrder);
		// Remove current step from dependentSteps where order less than currentOrder
		//else remove dependentOnSteps from current step where order greater than currentOrder.
		if((prevCateogryId == step.parent && currentOrder > prevOrder) || (stepParentOrder > prevCateogryOrder))
			this.removeDependentSteps(step);
		else
			this.removeDependentOnSteps(step);
	},

	/**
	* Handle dependencies conflict on categories reorder
	*/
	handleCategoryDependencies : function(stepId, prevOrder) {
		var step, steps, i;

		step = this.getStepDetails(stepId);
		steps = this.getCategorySteps(stepId);

		prevOrder = parseInt(prevOrder);
		currentOrder = parseInt(step.order);

		// remove dependency from dependent steps if any from previous categories and tasks.
		if(currentOrder > prevOrder) {
			// remove dependent steps on this category
			this.removeDependentSteps(step);
			for(i = 0; i < steps.length; i++)
				this.removeDependentSteps(steps[i]);
		} else {
			for(i = 0; i < steps.length; i++)
				this.removeDependentOnSteps(steps[i]);
		}
	},

	/**
	* remove dependency from all the tasks on this step
	* @param {object} step - stepObject => {sys_id, order, parent, parentOrder}
	*/
	removeDependentSteps : function(step) {
		var stepOrder,
			stepParentOrder,
			dependentSteps,
			dependentOrder,
			dependentParentOrder;

		if(!step)
			return;

		dependentSteps = this.getDependentSteps(step.sys_id);

		if(!(Array.isArray(dependentSteps) && dependentSteps.length > 0))
			return;

		stepOrder = parseInt(step.order);
		stepParentOrder = parseInt(step.parentOrder);

		for(var i = 0; i < dependentSteps.length; i++) {
			dependentParentOrder = parseInt(dependentSteps[i].parentOrder);
			dependentOrder = parseInt(dependentSteps[i].order);
			if((!stepParentOrder && stepOrder > dependentParentOrder) ||
				stepParentOrder > dependentParentOrder ||
				(stepParentOrder == dependentParentOrder && stepOrder > dependentOrder))
					this.removeStepDependency(dependentSteps[i].sys_id, step.sys_id);
		}
	},

	/**
	* Remove conflicting depenecies from this step
	* @param {object} step - stepObject => {sys_id, order, parent, parentOrder}
	*/
	removeDependentOnSteps : function(step) {
		var stepOrder,
			stepParentOrder,
			dependentOnSteps,
			dependentOrder,
			dependentParentOrder;

		if(!step)
			return;

		dependentOnSteps = this.getDependentOnSteps(step.sys_id);

		if(!(Array.isArray(dependentOnSteps) && dependentOnSteps.length > 0))
			return;

		stepOrder = parseInt(step.order);
		stepParentOrder = parseInt(step.parentOrder);

		for(var i = 0; i < dependentOnSteps.length; i++) {
			dependentOrder = parseInt(dependentOnSteps[i].order);
			dependentParentOrder = parseInt(dependentOnSteps[i].parentOrder);
			if(stepParentOrder < dependentParentOrder ||
				(stepParentOrder == dependentParentOrder && stepOrder < dependentOrder) ||
				(!dependentParentOrder && stepParentOrder < dependentOrder))
					this.removeStepDependency(step.sys_id, dependentOnSteps[i].sys_id);
		}
	},

	/**
	* remove this step from dependencies from other tasks on delete
	* @param {object} step - stepObject => {sys_id, order, parent, parentOrder}
	*/
	removeDependentStepsOnDelete : function(step) {
		var dependentSteps;

		if(!step)
			return;

		dependentSteps = this.getDependentSteps(step.sys_id);

		if(!(Array.isArray(dependentSteps) && dependentSteps.length > 0))
			return;

		for(var i = 0; i < dependentSteps.length; i++)
			this.removeStepDependency(dependentSteps[i].sys_id, step.sys_id);
	},

	/**
	* Remove dependency from current step
	* @param {string} - sys_id of step from which dependency needs to be deleted
	* @param {string} - sys_id of dependent step which needs to be removed
	*/
    removeStepDependency : function(stepId, dependency) {
		var dependencyGr,
			dependentOnSteps,
			update = false;

		var gr = new GlideRecord(this.constants.tables.m2m_step_dependency);
		gr.addQuery("guidance_step", stepId);
		gr.query();

		while(gr.next()) {
			dependencyGr = gr.setup_dependency.getRefRecord();
			dependentOnSteps = dependencyGr.dependent_on_steps.toString();
			dependentOnSteps = dependentOnSteps && dependentOnSteps.split(",");
			for(var i = 0; i < dependentOnSteps.length; i++) {
				if(dependentOnSteps[i] == dependency) {
					dependentOnSteps.splice(i, 1);
					update = true;
				}
			}
			if(update) {
				dependencyGr.dependent_on_steps = dependentOnSteps.join(",");
				dependencyGr.update();
			}
			update = false;
		}
	},

	/**
	* Get dependencies for current step
	*/
	getDependentOnSteps: function(stepId) {
		var stpe, dependentOnSteps = [];

		var gr = new GlideRecord(this.constants.tables.m2m_step_dependency);
		gr.addQuery("guidance_step", stepId);
		gr.query();
		while(gr.next()) {
			dependencyGr = gr.setup_dependency.getRefRecord();
			dependentSteps = dependencyGr.dependent_on_steps.toString();
			if(dependentSteps) {
				stepGr = new GlideRecord(this.constants.tables.guidance_step);
				stepGr.addQuery("sys_id", "IN", dependentSteps);
				stepGr.query();
				while(stepGr.next()) {
					step = {};
					step.sys_id = stepGr.getUniqueValue();
					step.order = stepGr.order.toString();
					step.parent = stepGr.parent && stepGr.parent.toString();
					step.parentOrder = stepGr.parent && stepGr.parent.order.toString();
					dependentOnSteps.push(step);
				}
			}
		}
		return dependentOnSteps;
	},

	/**
	* Get steps dependent on this step
	*/
	getDependentSteps : function(stepId) {
		var step, dependentSteps = [];

		var gr = new GlideRecord(this.constants.tables.setup_dependency);
		gr.addQuery("dependent_on_steps", "CONTAINS", stepId);
		gr.query();
		while(gr.next()) {
			var m2mGr = new GlideRecord(this.constants.tables.m2m_step_dependency);
			m2mGr.addQuery("setup_dependency", gr.getUniqueValue());
			m2mGr.query();
			while(m2mGr.next()) {
				step = {};
				step.sys_id = m2mGr.guidance_step.toString();
				step.order = m2mGr.guidance_step.order.toString();
				step.parent = m2mGr.guidance_step.parent && m2mGr.guidance_step.parent.toString();
				step.parentOrder = m2mGr.guidance_step.parent && m2mGr.guidance_step.parent.order.toString();
				dependentSteps.push(step);
			}
		}
		return dependentSteps;
	},

	/**
	* Get step details for current stepId
	*/
	getStepDetails : function(stepId) {
		var step;
		var gr = new GlideRecord(this.constants.tables.guidance_step);
		gr.addQuery("sys_id", stepId);
		gr.query();
		if (gr.next()) {
			step = {};
			step.sys_id = gr.getUniqueValue();
			step.order = gr.order.toString();
			step.parent = gr.parent && gr.parent.toString();
			step.parentOrder = gr.parent && gr.parent.order.toString();
		}
		return step;
	},

	/**
	* Get all the steps(tasks) for this stepId(cateogry)
	*/
	getCategorySteps : function(stepId) {
		var step, steps = [];
		var gr = new GlideRecord(this.constants.tables.guidance_step);
		gr.addQuery("parent", stepId);
		gr.query();
		while(gr.next()) {
			step = {};
			step.sys_id = gr.getUniqueValue();
			step.order = gr.order.toString();
			step.parent = gr.parent && gr.parent.toString();
			step.parentOrder = gr.parent && gr.parent.order.toString();
			steps.push(step);
		}
		return steps;
	},

    type: 'SNHelpSetupDependencyService'
};
