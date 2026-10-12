var SNHelpSetupUtil = Class.create();
SNHelpSetupUtil.prototype = {
    
	initialize: function() {

		this.constants = new SNHelpSetupConstantProvider();
		this.actions = ["next", "prev", "skip", "submitted", "closed", "started", "completed", "retake"];
		this.pluginCategory = null;
		this.pluginTasks = null;
    },
	
	getDependencies : function(step_id) {
		var dependencies = this.getM2Mdependencies(step_id);
		var result = [];
		
		if (!dependencies) 
			return null;
		
		if(Array.isArray(dependencies) && dependencies.length > 0) {
			var self = this;
			dependencies.forEach(function(dependency){
				result.push(self.getAllDependecies(dependency.setup_dependency));
			});
		}
		return result;
	},
	
	getM2Mdependencies : function(step_id){
		var dbController = new global.SNHelpDBController(this.constants.tables.m2m_step_dependency);
		var dependencies =  dbController.getByEncodedQuery("guidance_step=" + step_id, null, ["sys_id", "setup_dependency"]);
		
		return dependencies ? dependencies : null;
	},
	
	// @param - sys_id of setup_dependency table
	getAllDependecies: function(sys_id) {
		var dbController = new global.SNHelpDBController(this.constants.tables.setup_dependency);
		return dbController.getById(sys_id, ["sys_id", "dependent_on_plugins","dependent_on_store_apps","dependent_on_steps", "name"]);
	},
	
	isStepDependent : function(step_id) {
		var dependencies = this.getM2Mdependencies(step_id);
		
		if(!dependencies || (Array.isArray(dependencies) && dependencies.length === 0))
			return false;
		
		return true;
	},
	
	
	isStepLocked : function(step_id, interactionId) {
		var dependencies = this.getDependencies(step_id);
		var length;
		if(!dependencies || (Array.isArray(dependencies) && dependencies.length === 0))
			return false;
		
		length = dependencies.length;
		
		for(var i = 0; i < length; i++) {
			if (this.isAllPluginsActive(dependencies[i].dependent_on_plugins) &&
				this.isAllStoreAppsActive(dependencies[i].dependent_on_store_apps) && 
				this.isAllStepsCompleted(dependencies[i].dependent_on_steps, interactionId))
					continue;
			
			return true;
		}
		return false;
	},
	
	isAllPluginsActive : function(dependentPlugins) {
		var pgMgr;
		
		if(!dependentPlugins)
			return true;
		
		dependentPlugins = dependentPlugins.split(",");
		pgMgr = new GlidePluginManager();
		
		for(var i = 0; i < dependentPlugins.length; i++)
			if(!pgMgr.isActive(dependentPlugins[i]))
				return false;
		
		return true;
	},
	
	isAllStoreAppsActive : function(dependentStoreApps) {
		var dbController;
		
		if(!dependentStoreApps)
			return true;
		
		dbController =  new global.SNHelpDBController("sys_store_app");
		
		dependentStoreApps = dependentStoreApps.split(",");
		
		for(var i = 0; i < dependentStoreApps.length; i++)
			if(!this.isStoreAppActive(dependentStoreApps[i]))
				return false;
		
		return true;
	},
	
	//Revisit: check if there is a best way to check if an application is active
	isStoreAppActive : function(sys_id) {
		var dbController =  new global.SNHelpDBController("sys_store_app");
		var result = dbController.getById(sys_id, ["active"]);
		if(result.active === "true")
			return true;
		
		return false;
	},
	
	//Assumption : There exists only one interaction per user for personal setup and one per system for global setup
	isAllStepsCompleted : function(dependentSteps, interactionId) {
		var dbController,
			stepInteraction;
		//If there is no steps return true
		if(!dependentSteps)
			return true;
		
		// If there is no interaction created, return false
		if(!interactionId) 
			return false;
		
		dbController =  new global.SNHelpDBController(this.constants.tables.user_interaction_step);
		
		stepInteraction = dbController.getByEncodedQuery("stepIN" + dependentSteps, null, ["status"]);
		dependentSteps = dependentSteps.split(",");
		
		if(!stepInteraction ||dependentSteps.length !==  stepInteraction.length)
			return false;
		
		for(var i = 0; i < stepInteraction.length; i++) 
			if(stepInteraction[i].status != "completed")
				return false;
		
		return true;
	},
	
    getDate: function(utc){
		var gdt = new GlideDateTime(utc);
		return  gdt.getDate().getDisplayValue(); 
	},

	/**
	* adjust step order on step delete
	* @param {string} field - field to query step table
	* @param {string} value - value to query step table again field
	* @param {object} current - current gliderecord for current step
	*/
    adjustOrder: function(field, value, current) {
        // orphan record - Dont do anything (setup or category deleted)
        if (!current[field].getRefRecord().isValidRecord())
            return;

        var table = current.getRecordClassName();
        var gr = new GlideRecord(table);

        gr.addQuery(field, value);

		if (field === 'guidance')
            gr.addNullQuery("parent");

        gr.addQuery("order", ">=", current.order);
        gr.orderBy("order");
        gr.query();

        while (gr.next()) {
            // There exist another step with same order - don't do anything
            if (gr.order == current.order)
                return;
            // Adjust the order to accommodate deleted step order.
            else if (gr.order > 0) {
                gr.order = gr.order - 1;
                gr.update();
            }
        }
    },
	/*
	  Builder - Utility method to set the status of the parent. 
	  @param stepId
	  @param status
	  @return glide update  
	*/
	
	setStepStatus:function(stepId, status){
		var gr = new GlideRecord(this.constants.tables.guidance_step);
		gr.addEncodedQuery('sys_id='+stepId, true);
		gr.query();
		if(gr.next()){
			gr.setValue('status', status);
			return gr.update();
		}
		return; 
	},
	
	/*
	  Builder - Utility method to see all the taks in the parent are completed or not. 
	  @param parentId
	  @return true/false
	*/
	isAllTasksCompleted: function(parentId){
		var gr, isTasksCompleted = true, 
			query = 'parent='+parentId;
		
		
		
		gr = new GlideRecord(this.constants.tables.guidance_step);
		gr.addEncodedQuery(query, true);
		gr.query();
		
		//No chlild Taks return false
		if(!gr.hasNext())
			return false; 
		
		while(gr.next()){
			if(gr.status.toString() != '0')
				return false; //Ensure all tasks are configured
		}
		return isTasksCompleted;
	},
	
	/*
		Get m2m dependencies whose dependent steps are matchted to given step id. 
		@param stepId 
		@return array of m2m dependnecies  
	*/
	
	getDependentSteps: function(stepId){
		var dbController; 
		dbController = new global.SNHelpDBController(this.constants.tables.m2m_step_dependency);
		return dbController.getByEncodedQuery("setup_dependency.dependent_on_stepsLIKE"+stepId, null, ['sys_id', 'guidance_step']);
	},
	
	/*
	    @param string step id's 
		@param stepIds 
		@param taskKeys keys that needs to be extracted from step (id, name, order)
		@return array matched steps from the given step id's 
	*/
	
	getMatchedtasks : function(stepArray, stepIds, taskKeys){
		var matchedSteps =[], results=[], result, arrayUtil = new global.ArrayUtil();
		
		if(!stepIds)
			return [];
		stepIds = stepIds.split(",");
		stepArray.forEach(function(step){
			if(arrayUtil.contains(stepIds, step.id))
				matchedSteps.push(step);
		});
		
		matchedSteps.forEach(function(step){
			if(Array.isArray(taskKeys) && taskKeys.length > 0){
				result = {};
				taskKeys.forEach(function(taskKey){
					result[taskKey] = step[taskKey];
				});
			}
			results.push(result);
		});
		
		return results; 
	},
	
	isValidAction: function(action) {
		var arrayUtil = new global.ArrayUtil();
		return arrayUtil.contains(this.actions, action);
	},
	/**
	* Check if the given setup has a plugin category
	* @param {setupId} - Setup sys_id to find plugin category
	* @returns {sys_id} - install plugin category sys_id
	*/
	hasPluginStep: function(setupId) {
		var result = null;
		var gr = new GlideRecord("help_content");
		gr.addQuery("guidance_step.guidance", setupId);
		gr.addQuery("configuration_types", "install_plugin");
		gr.query();

		result = gr.next() && gr.guidance_step.parent;

		return  result ? result : null;
	},
	
	
	/*
	    @param arrray tasks
		@param array stepsPayload 
		@return array tasks with dependencies and dependents required format  {"id","name","parent", "order"} 
	*/
	
	getMatchedDependencies: function(tasksPayload, stepsPayload){
		var results = [], self = this, steps, dependentsObj = []; 
		
		if(!Array.isArray(tasksPayload) || !Array.isArray(stepsPayload))
			return null; 
		
		steps = tasksPayload.concat(stepsPayload);
		
		tasksPayload.forEach(function(task){
			if(Array.isArray(task.dependencies) && task.dependencies.length > 0){
				task.dependenciesObj = self.getMatchedtasks(steps, task.dependencies[0].dependent_on_steps, self.constants.restAPIKeys.dependencies);
				task.dependencies = [];
				task.dependenciesObj.forEach(function(dependencyKey){
					task.dependencies.push(dependencyKey.name); 
				});
				
			}
			if(Array.isArray(task.dependents) && task.dependents.length >0){
				dependentsObj = []; 
				task.dependents.forEach(function(dependent){
					dependentsObj.push(dependent.guidance_step);
				});
				
				task.dependents = self.getMatchedtasks(steps, dependentsObj.toString(), self.constants.restAPIKeys.dependencies);
			}
		});
		
		return tasksPayload;
	},
	
	
	/*
	    @param sys_id of the parent 
		@param task type 
		@return true/ false - Returns if the category has childern or not 
	*/
	
	hasChildOfType: function(sys_id, type){
		var gr, query;
		
		if(type == "basic")
			query = "parent="+sys_id+"^task_type=basic"; 
		else if(type == "recommended"){
			query = "parent="+sys_id+"^task_type=basic^ORtask_type=recommended";
		}else if(type == "advanced"){
			query = "parent="+sys_id+"^task_type=basic^ORtask_type=recommended^ORtask_type=advanced";
		}
		
		gr = new GlideRecord(this.constants.tables.guidance_step);
		gr.addEncodedQuery(query, true);
		gr.query();
		return gr.getRowCount() > 0 ? true: false; 

	}, 
	
	/*
	 @param sys_id Guidance Id
	 return true/false - checks if all the mandatory tasks are completed by the user 
	*/
	isAllMandatoryTasksCompleted: function(sys_id, userItr, task_type){
		var grStep, grInteraction, stepsQuery, interactionQuery, stepCount, itrCount, queryTaskType; 
		
		if(task_type === "recommended"){
			queryTaskType = ["basic","recommended"];
		}
		else if(task_type === "advanced"){
			queryTaskType = ["basic","recommended", "advanced"];
		}
		else{
			queryTaskType = ["basic"];
		}
		stepsQuery = "parentISNOTEMPTY^task_type="+queryTaskType.join('^ORtask_type=')+"^guidance="+sys_id;
		interactionQuery = "step.parentISNOTEMPTY^step.task_type="+queryTaskType.join('^ORstep.task_type=')+"^user_interaction="+userItr+"^status=completed";
		
		grStep = new GlideRecord(this.constants.tables.guidance_step);
		grStep.addEncodedQuery(stepsQuery, true);
		grStep.query();
		stepCount = grStep.getRowCount();
		
		grInteraction = new GlideRecord(this.constants.tables.user_interaction_step);
		grInteraction.addEncodedQuery(interactionQuery, true);
		grInteraction.query();
		itrCount = grInteraction.getRowCount();
		
		if(stepCount > 0 && itrCount > 0 && stepCount == itrCount)
			return true;
		return false; 
	},


	
	hasFullURI: function(uri) {
        // if :/ appears before sysparm_query then consider it a full URL, otherwise allow it since http:// can appear
        // as part of the parameter
        var slashIndex = uri.indexOf(":/");
        var sysParmQueryIndex = uri.indexOf("sysparm_query");
        if (slashIndex > -1 && (sysParmQueryIndex == -1 || slashIndex < sysParmQueryIndex))
            return true;

        var uriTrimmed = uri.trim();
        if (uriTrimmed.startsWith("//") || uriTrimmed.startsWith("\\\\") || uriTrimmed.startsWith("/\\") || uriTrimmed.startsWith("\\/"))
            return true;

        return false;
    },
	
	/*
	 @param sys_id Guidance Id
	 return true/false - checks if all the mandatory tasks are completed by the user 
	*/
	
	
	pluginCategoryHasTasks: function(sys_id, task_type){
		
		var gr, stepGr, contentQuery, stepQuery, stepId;
		
		if(!sys_id || !task_type)
			return false; 
		
		stepQuery = "parent="+sys_id+"^task_type="+task_type;
		stepGr = new GlideRecord(this.constants.tables.guidance_step);
		stepGr.addEncodedQuery(stepQuery, true);
		stepGr.query();
		while(stepGr.next()){
			stepId = stepGr.getValue("sys_id").toString();
		}
		if(!stepId)
			return false; 
		
		contentQuery = 'guidance_step='+stepId+'^recordsISNOTEMPTY';
		gr = new GlideRecord(this.constants.tables.content);
		gr.addEncodedQuery(contentQuery, true);
		gr.query();
		return gr.getRowCount() > 0; 
	},
	// check if the step is dependent on plugin Step
	isDependentOnPluginStep : function(step) {
		if(!step || !step.dependencies)
			return false;
		
		this.pluginCategory = this.pluginCategory || this.hasPluginStep(step.guidance);
		
		if(!this.pluginCategory)
			return false;
		
		this.pluginTasks = this.pluginTasks || this.getPluginTasks(step.guidance, this.pluginCategory);
		
		for(var i = 0; i < this.pluginTasks.length; i++) {
			if(step.dependencies[0].dependent_on_steps.indexOf(this.pluginTasks[i].sys_id) >= 0)
				return true;
		}
		return false;
	},
	
	isPluginTaskCompleted : function(step, interactionId) {
		var pluginTask, 
			advPluginTask,
			dependencies;
		
		if(!this.pluginTasks)
			return;
		
		if(step.task_type == "advanced") {
			return !this.isStepLocked(step.sys_id, interactionId);
		} else {
			pluginTask = this.pluginTasks.filter(function(pluginTask) {
				return pluginTask.task_type == step.task_type;
			});
			advPluginTask = this.pluginTasks.filter(function(pluginTask) {
				return pluginTask.task_type == "advanced";
			});
			dependencies = step.dependencies[0].dependent_on_steps.split(",");
			dependencies = dependencies.filter(function(dependency) {
				return dependency != advPluginTask[0].sys_id;
			});
			dependencies.push(pluginTask[0].sys_id);
			dependencies = dependencies.join(",");
			
			return this.isAllStepsCompleted(dependencies, interactionId);
		}	
	},
	
	getPluginTasks : function(setupId, pluginCategory) {
		var dbController = new global.SNHelpDBController(this.constants.tables.guidance_step);
		var query = "guidance=" + setupId + "^parent=" + pluginCategory;
		var tasks = dbController.getByEncodedQuery(query, "", ["sys_id", "name", "task_type", "description", "rich_description"]);
		var content;
		if(Array.isArray(tasks) && tasks.length > 0) {
			dbController = new global.SNHelpDBController(this.constants.tables.content);
			for(var i = 0; i < tasks.length; i++) {
				content = dbController.getByEncodedQuery("guidance_step=" + tasks[i].sys_id, "", ["sys_id", "records"]);
				tasks[i].content = (Array.isArray(content) && content.length > 0) ? content[0] : {};
			}
		}
		return tasks;
	},

	isAnyTaskStarted: function(guidanceId, categoryId) {
        gr = new GlideRecord(this.constants.tables.guidance_step);
        gr.addQuery("parent", categoryId);
        gr.addEncodedQuery("status!=1");
        if (categoryId == this.hasPluginStep(guidanceId))
            gr.addQuery("task_type", this.constants.taskType.ADVANCED);
        gr.query();
        return gr.getRowCount() > 0;
    },
	
    type: 'SNHelpSetupUtil'
};
