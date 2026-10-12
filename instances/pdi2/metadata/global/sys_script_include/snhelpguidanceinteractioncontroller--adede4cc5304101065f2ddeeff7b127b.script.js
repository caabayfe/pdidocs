var SNHelpGuidanceInteractionController = Class.create();
SNHelpGuidanceInteractionController.prototype = {
	MISSING_SYS_ID: gs.getMessage("Missing sys_id"),
	SAVE_ERROR: gs.getMessage("Error saving guidance interaction"),
	MISSING_GUIDANCE_ID : gs.getMessage("Guidance ID is missing"),
	MISSING_CURR_STEP_DATA : gs.getMessage("Current Step data is required"),
	MISSING_GUIDANCE_STEP_ACTION: gs.getMessage("Guidance Step Action is missing"),
	MISSING_CURR_STEP_SYS_ID : gs.getMessage("Current step sys_id is missing"),

    initialize: function() {
		this.constants = new SNHelpConstantProvider();
		this.dbController = new SNHelpDBController(this.constants.tables.user_interaction);
		this.stepController = new SNHelpGuidanceStepInteractionController();
    },
	
	create: function(params) {
		
		var result = this._validateParams(params);

		if(result.error) {
			result.status = this.constants.httpStatus.BAD_REQUEST;
			return result;
		}

		var sys_id = this.createRecord(params);

		if(sys_id) {
			result.status = this.constants.httpStatus.SUCCESS;
			result.data = {
				sys_id : sys_id
			};
		}

		return result;
	},
	update: function(sys_id, params) {
		var result = {};
		if(parseInt(sys_id) === -1) {
			sys_id = this.createRecord(params);
		}

		if(!sys_id) {
			result.error = this.MISSING_SYS_ID;
			result.status = this.constants.httpStatus.BAD_REQUEST;
			return result;
		} else if(!GlideStringUtil.isEligibleSysID(sys_id)) {
			result.status = this.constants.httpStatus.BAD_REQUEST;
			result.error = gs.getMessage("Invalid sys_id {0}", sys_id);
			return result;
		}

		result = this._validateParams(params, true);

		if(result.error) {
			result.status = this.constants.httpStatus.BAD_REQUEST;
			return result;
		}
		var stepParams = params.currentStep;
			stepParams.user_interaction = sys_id;
			stepParams.status = this._determineStepStatus(stepParams.action);

		var currentStep = this.stepController.createRecord(stepParams);

		if(currentStep) {
			params.current_step = currentStep;
			params.status = this._determineInteractionStatus(stepParams.status,stepParams.isLastStep);
			params.user = gs.getUserID();

			if(params.answers)
				params.answers = JSON.stringify(this._getAllAnswers(sys_id, params.answers));
		}

		sys_id = this.updateRecord(sys_id, params);
		
		if(sys_id) {
			result.status = this.constants.httpStatus.SUCCESS;
			result.data = {
				sys_id : sys_id,
				step_sys_id : currentStep

			};
		} else {
			result.status = this.constants.httpStatus.INTERNAL_ERROR;
			result.error = this.SAVE_ERROR;
		}
		return result;
	},

	getById: function(sys_id) {
		return 	this.dbController.getById(sys_id);
	},

	getByEncodedQuery: function(queryString, orderByField, fields) {
		return this.dbController.getByEncodedQuery(queryString, orderByField, fields);
	},

	createRecord: function(params) {
		return this.dbController.create(params);
	},

	updateRecord: function(sys_id, params) {
		return this.dbController.update(sys_id, params);
	},

	_validateParams: function(params, checkStep) {
		var result = {};
		var action;
		if(!params.guidance)
			result.error = this.MISSING_GUIDANCE_ID;
		else if(!GlideStringUtil.isEligibleSysID(params.guidance))
			result.error = gs.getMessage("Invalid Guidance sys_id {0}", params.guidance);
		else if(checkStep) {
			action = params.currentStep.action;
			if(!params.currentStep)
				result.error = this.MISSING_CURR_STEP_DATA;
			else if(!action)
				result.error = this.MISSING_GUIDANCE_STEP_ACTION;
			else if(!params.currentStep.step)
				result.error = this.MISSING_CURR_STEP_SYS_ID;
			else if(action && !this._isValidAction(action))
				result.error = gs.getMessage("Invalid action {0}", action);
		}
		return result;
	},

	_getAllAnswers: function (sys_id, answers){
		var result = this.getById(sys_id);

		if(!result || !result.answers)
			return answers;

		var prevAnswers = [];
		try {
			prevAnswers	= JSON.parse(result.answers);
		} catch (e) {
			gs.warn("SNHelpGuidanceInteractionController: Error parsing previous steps answers json");
		}

		if(!Array.isArray(answers))
			return prevAnswers;

		var newQuestions= [];

		answers.forEach(function(answer) {
			newQuestions.push(answer.id);
		});

		// update the previously answered question if any
		prevAnswers.forEach(function(answer) {
			var index = newQuestions.indexOf(answer.id);
			if(index !== -1) {
				answer.values = answers[index].values;
				answers.splice(index, 1);
				newQuestions.splice(index,1);
			}
		});

		// add remaining answers
		answers.forEach(function(answer) {
			prevAnswers.push(answer);
		});

		return prevAnswers;
	},
	_determineStepStatus: function(action) {
		switch(action) {
			case this.constants.actions.NEXT:
			case this.constants.actions.SUBMIT:
				return this.constants.status.COMPLETE;

			case this.constants.actions.PREVIOUS:
				return this.constants.status.IN_PROGRESS;

			case this.constants.actions.SKIP:
				return this.constants.status.SKIPPED;

			case this.constants.actions.CLOSED:
				return this.constants.status.ABANDONED;
		}
	},
	_isValidAction: function(action) {
		switch(action) {
			case this.constants.actions.NEXT:
			case this.constants.actions.SUBMIT:
			case this.constants.actions.PREVIOUS:
			case this.constants.actions.SKIP:
			case this.constants.actions.CLOSED:
				return true;
			default:
				return false;
		}
	},
	_determineInteractionStatus: function(stepStatus, isLastStep) {
		if(isLastStep === false && stepStatus === this.constants.status.COMPLETE)
			return this.constants.status.IN_PROGRESS;
		else
			return stepStatus;
	},
	/**
	* Get interaction record by Guidance ID 
	* @param : guidanceId
	* @param : isGlobal - if guidance is global (for global setup)
	* @return : user interaction record for given guidance ID with assoicated steps interactions, if any
	* NOTE : We assume that there will be just one interaction record per user for each personal setup type guidance or one per system for global setup 
	*/
	
	getByGuidanceId : function(guidanceId, isGlobal) {
		var interaction = this.findInteraction(guidanceId, isGlobal);
		var interactionStepFields;
		var orderByField = "sys_updated_on";
		
		if(!interaction)
			return null;
		
		// query interaction step records for immediate guidance steps & their related steps...
		interactionStepFields = this.constants.restAPIKeys.interactionStep;
		interaction.interactionStep = this.stepController.getByEncodedQuery("user_interaction=" + interaction.sys_id + "^related_user_interaction_step=NULL", orderByField, interactionStepFields);
		
		return interaction;
	},
	
	findInteraction: function(guidanceId, isGlobal) {
		var interaction;
		var fields = this.constants.restAPIKeys.interaction;
		
		var orderByField = "timestamp";
		var query = "guidance=" + guidanceId;
		
		if(!isGlobal) 
			query += "^user=" + gs.getUserID();
		
		interaction = this.getByEncodedQuery(query, orderByField, fields);
		if(!interaction) 
			return null;
		
		if(interaction && Array.isArray(interaction)) {
			if(interaction.length > 0)
				interaction = interaction[0];
			
			// log warnning message if we have multiple interaction records 
			if(interaction.length > 1) {
				if(isGlobal)
					gs.warn(gs.getMessage("Multiple Interaction records found for guidance {0}", guidanceId));
				else
					gs.warn(gs.getMessage("Multiple Interaction records found for guidance {0}, for user {1}", guidanceId, gs.getUserDisplayName()));		
			}	
		}
		return interaction;
	},
	
    type: 'SNHelpGuidanceInteractionController'
};
