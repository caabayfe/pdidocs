//REST Handler for Guidance
var SNHelpGuidanceRestHandler = Class.create();
SNHelpGuidanceRestHandler.prototype = {

    initialize: function() {
        this._helpConstants = new SNHelpConstantProvider();
        this._guidanceCtrl = new SNHelpGuidanceController();
        this._helpUtil = new SNHelpUtil();
    },

    _getQuestionAnswers: function(questions, question_map, answer_map) {

        var i;

        if (!questions) {
            return null;
        }

        questions = this._helpUtil.constructPayLoad(question_map, questions);
        for (i = 0; i < questions.length; i++) {
            questions[i].answers = this._helpUtil.constructPayLoad(answer_map, questions[i].answers);
        }
        return questions;
    },

    /*
     *  @param Guidance sys_id
     *  returns guidance
     */

    getGuidance: function(sys_id) {

        var guidance_record, guidance, i, content, result = {},
            step_keys;

        if (!GlideStringUtil.isEligibleSysID(sys_id)) {
            this._helpUtil.setError(this.type, this._helpConstants.errorMessages.empty_sys_id);
            result.status = this._helpConstants.httpStatus.BAD_REQUEST;
            result.error = this._helpConstants.errorMessages.empty_sys_id;
            return result;
        }

        guidance_record = this._guidanceCtrl.getGuidance(sys_id);

        if (!guidance_record) {

            result.status = this._helpConstants.httpStatus.NOT_FOUND;
            result.error = this._helpConstants.errorMessages.no_records;
            return result;
        }
        var isDraft = guidance_record.guidance.status === "draft";
        if (isDraft) {
            this._helpUtil.setError(this.type, this._helpConstants.errorMessages.draft_sys_id, sys_id);
            result.status = this._helpConstants.httpStatus.NOT_FOUND;
            result.error = this._helpConstants.errorMessages.draft_sys_id;
            return result;
        }

        guidance_record = this._helpUtil.constructPayLoad(this._helpConstants.restAPIKeys.guidance, [guidance_record.guidance]);
        guidance = Array.isArray(guidance_record) && guidance_record.length > 0 && guidance_record[0];

        if (!guidance || !(Array.isArray(guidance.steps) && guidance.steps.length > 0)) {

            result.status = this._helpConstants.httpStatus.SUCCESS;
            result.data = guidance;
            return result;
        }

        step_keys = this._helpConstants.restAPIKeys.guidance_step;
        if (guidance.type === this._helpConstants.guidanceType.CALLOUT) {
            step_keys = step_keys.concat(this._helpConstants.calloutRestKeys.step);
        }

        guidance.steps = this._helpUtil.constructPayLoad(step_keys, guidance.steps);

        //Get the content
        for (i = 0; i < guidance.steps.length; i++) {

            content = this._helpUtil.constructPayLoad(this._helpConstants.restAPIKeys.content, guidance.steps[i].content);

            if (!content)
                continue;
            //constructPayLoad always returns an array. only one content record for earch step
            content = Array.isArray(content) && content.length > 0 && content[0];
            if ((guidance.steps[i].layout === this._helpConstants.stepLayout.QUESTION ||
                    guidance.steps[i].layout === this._helpConstants.stepLayout.IMAGE_QUESTION) && content.questions) {
                content.questions = this._getQuestionAnswers(content.questions, this._helpConstants.restAPIKeys.question, this._helpConstants.restAPIKeys.answer);
            }
            guidance.steps[i].content = content;
        }

        result.status = this._helpConstants.httpStatus.SUCCESS;
        result.data = guidance;

        return result;
    },

    getDocumentById: function(sys_id) {
        var docController, doc;

        if (!GlideStringUtil.isEligibleSysID(sys_id))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, this._helpConstants.errorMessages.invalid_sys_id);

        docController = new SNHelpDocumentController();
        doc = docController.getById(sys_id);

        if (!doc)
            return this.serviceError(this._helpConstants.httpStatus.NOT_FOUND, this._helpConstants.errorMessages.no_records);

        //Can user create/update help
        doc.allowEdit = this._helpUtil.canEditHelp();

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
                doc: doc,
                showFeedback: this._helpConstants.showPanelFeedback
            }
        };
    },
    /* Return resource by sys_id or resource_id */
    getResourceById: function(id, isSysId) {
        var resController, res;

        if (!id)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, this._helpConstants.errorMessages.empty_sys_id);

        if (isSysId && !GlideStringUtil.isEligibleSysID(id))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, this._helpConstants.errorMessages.invalid_sys_id);

        resController = new SNHelpResourceController();

        if (isSysId)
            res = resController.getById(id);
        else
            res = resController.getByResourceId(id);

        if (!res)
            return this.serviceError(this._helpConstants.httpStatus.NOT_FOUND, this._helpConstants.errorMessages.no_records);

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: res
        };
    },

	_isAIUXRequest: function(url) {
		if (!url) return false;
		var pathname = url.replace(/^.*\/\/[^\\/]+/, '');
		var aiuxPathPrefix = '/aiux/';
		var aiuxClassicPrefix = '/aiux/ui/classic';
		var aiuxWorkspacePrefix = '/aiux/ui/workspace/';

		if (pathname.startsWith(aiuxPathPrefix)) {
			if (pathname.startsWith(aiuxClassicPrefix) || pathname.startsWith(aiuxWorkspacePrefix)) return false;
			return true;
		}
		return false;
	},

    searchDocumentsAndTours: function(url, routeObj, includeAppshellTours) {
        var panelController, docs, message;

        if (!routeObj)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Route Object is missing"));
        if (!url)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("URL is missing"));

        panelController = new SNHelpPanelController();
        docs = panelController.searchPanelContent(url, routeObj) || [];

        var isToursEnabled = this._isAIUXRequest(url) ? gs.getProperty('com.snc.guided_tours.ai_experience.enable', false) === 'true' : gs.getProperty('com.snc.guided_tours.standard_ui.enable', false) === 'true';
        var tours = [];
        if (isToursEnabled) {
            var toursController = new sn_tourbuilder.GTAutoLaunchController();
			//Regex is picked from app-tourbuilder dataservice
            var pathName = url.replace(/^.*\/\/[^\\/]+/, '');
            var tourPageContext = {
                page_id: [pathName.substr(1)],
                context: [pathName],
			    include_appshell_tours: includeAppshellTours
            };
			if (this._isAIUXRequest(url)) tourPageContext['type'] = 'aiux';
            var tourResult = toursController.getTours(tourPageContext);
            if (tourResult && tourResult.success) {
                tours = tourResult.payload;
            }
        }

		var isDGEnabled = gs.getProperty('com.glide.dynamic_guidance.enabled', false) === 'true';
		var hasDGAccess = false;
		if(isDGEnabled) {
			var utility = new sn_help_assistant.DynamicGuidanceUtility();
			if (utility.hasLLMAccess()) {
				hasDGAccess = true;
			}
		}

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
				documents: docs,
				emptyPanelMessage: this._helpConstants.emptyPanelMessage,
				allowEdit: this._helpUtil.canEditHelp(),
				isAISEnabled: gs.getProperty("glide.ais.enabled") === 'true' && gs.getProperty("glide.ais.initialized") === 'true' && gs.getProperty("com.glide.sn_help.panel.show_search") === 'true',
				isToursEnabled: isToursEnabled,
				tours: tours,
				hasDGAccess: hasDGAccess
			}
        };
    },

    // sys_id of setup 
    getSetup: function(sys_id) {
        var setup, setupController;

        if (!sys_id)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid sys_id {0}", sys_id));

        setupController = new SNHelpSetupController();

        setup = setupController.getSetupDetailsWithStatus(sys_id);

        if (!setup)
            return this.serviceError(this._helpConstants.httpStatus.NOT_FOUND, this._helpConstants.errorMessages.no_records);

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
                setup: setup
            }
        };
    },

    getSetupStepTasks: function(step_id, interactionId) {
        var result, setupController;

        if (!step_id)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid sys_id for group {0}", sys_id));

        setupController = new SNHelpSetupController();
        result = setupController.getAllTasksForStepWithStatus(step_id, interactionId);

        if (!result)
            return this.serviceError(this._helpConstants.httpStatus.NOT_FOUND, this._helpConstants.errorMessages.no_records);
        // result is an object -  { tasks : [] || null, interaction : [] || null}
        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: result
        };
    },

    getStepTaskDetails: function(task_id, interactionId) {
        var taskDetails, setupController;

        if (!task_id)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid sys_id for task {0}", sys_id));

        setupController = new SNHelpSetupController();
        taskDetails = setupController.getTaskDetailsWithStatus(task_id, interactionId);

        if (!taskDetails)
            return this.serviceError(this._helpConstants.httpStatus.NOT_FOUND, this._helpConstants.errorMessages.no_records);

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
                taskDetails: taskDetails
            }
        };
    },

    serviceError: function(status, errorMessage) {
        this._helpUtil.setError(this.type, errorMessage);
        return {
            status: status,
            error: errorMessage
        };
    },

    type: 'SNHelpGuidanceRestHandler'
};
