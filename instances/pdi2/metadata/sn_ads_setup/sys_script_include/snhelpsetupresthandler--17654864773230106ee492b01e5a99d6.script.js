var SNHelpSetupRestHandler = Class.create();
SNHelpSetupRestHandler.prototype = {
    initialize: function() {
        var helpService = new global.SNHelpService();
        this._helpUtil = helpService.helpUtil;
        this._helpConstants = helpService.helpConstant;
        this.setupService = new SNHelpSetupService();
        this.setupUtil = new SNHelpSetupUtil();
    },

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

    selectGuidance: function(sys_id) {
        var setup, setupController;

        if (!sys_id)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid sys_id {0}", sys_id));

        setupController = new SNHelpSetupController();

        setup = setupController.selectGuidance(sys_id);

        if (!setup)
            return this.serviceError(this._helpConstants.httpStatus.NOT_FOUND, this._helpConstants.errorMessages.no_records);

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
                setup: setup
            }
        };
    },

    getSetupStepTasks: function(step_id, interactionId, task_type) {
        var result, setupController;

        if (!step_id)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid sys_id for group {0}", sys_id));

        setupController = new SNHelpSetupController();
        result = setupController.getAllTasksForStepWithStatus(step_id, interactionId, task_type);

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

    upsertSetupStep: function(setupId, stepId, data) {
        var result = {};
        var setupController = new SNHelpSetupController();
        if (this.setupService.isValidSetupId(setupId)) {
            result = setupController.upsertSetupStep(setupId, stepId, data);
            if (result.data) {
                result.status = result.status || 200;
            }
        } else {
            result.status = 404;
            result.message = gs.getMessage("Can't find setup with sys_id {0}", setupId);
        }

        return result;
    },

    getSetupStep: function(setupId, stepId) {
        var result = {};
        var step;
        var setupController = new SNHelpSetupController();
        if (this.setupService.isValidSetupId(setupId)) {
            step = setupController.getStepDetails(stepId);
            if (step) {
                result.data = step;
                result.status = 200;
            } else {
                result.status = 404;
                result.message = gs.getMessage("Can't find setup step with sys_id {0}", stepId);
            }
        } else {
            result.status = 404;
            result.message = gs.getMessage("Can't find setup with sys_id {0}", setupId);
        }
        return result;
    },

    getGuidanceSummary: function(sys_id) {

        var setup, setupController;

        if (!sys_id)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid sys_id {0}", sys_id));

        setupController = new SNHelpSetupController();

        setup = setupController.getGuidanceSummary(sys_id);

        if (!setup)
            return this.serviceError(this._helpConstants.httpStatus.NOT_FOUND, this._helpConstants.errorMessages.no_records);

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
                setup: setup
            }
        };

    },

    createDependency: function(dependencyId, stepId, params) {

        var dependency, setupController;

        if (!stepId)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid step_id {0}", stepId));

        if (dependencyId != "-1")
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid dependncy {0}", dependencyId));

        setupController = new SNHelpSetupController();

        dependency = setupController.createM2MDependency(dependencyId, stepId, params);

        if (!dependency)
            return this.serviceError(this._helpConstants.httpStatus.INTERNAL_ERROR, this._helpConstants.errorMessages.no_records);

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
                dependency: dependency
            }
        };

    },

    updateDependency: function(stepId, dependencyId, params) {

        var dependency, setupController;

        if (!stepId || !dependencyId)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid stepId {0} or dependencyId {1}", stepId, dependencyId));

        setupController = new SNHelpSetupController();

        dependency = setupController.updateM2MDependency(stepId, dependencyId, params);

        if (!dependency)
            return this.serviceError(this._helpConstants.httpStatus.INTERNAL_ERROR, this._helpConstants.errorMessages.no_records);

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
                dependency: dependency
            }
        };

    },

    getStepDependency: function(dependencyId, stepId) {

        var dependencies, setupController;

        if (!dependencyId || !stepId)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid stepId {0} or dependencyId {1}", stepId, dependencyId));

        setupController = new SNHelpSetupController();

        dependencies = setupController.getStepM2MDependency(dependencyId, stepId);

        if (!dependencies)
            return this.serviceError(this._helpConstants.httpStatus.INTERNAL_ERROR, this._helpConstants.errorMessages.no_records);

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
                dependencies: dependencies,
            }
        };

    },

    deleteDependency: function(dependencyId, stepId) {
        var dependencies, setupController;

        if (!dependencyId || !stepId)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid stepId {0} or dependencyId {1}", stepId, dependencyId));

        setupController = new SNHelpSetupController();

        dependencies = setupController.deleteM2MDependency(dependencyId, stepId);

        if (!dependencies)
            return this.serviceError(this._helpConstants.httpStatus.INTERNAL_ERROR, this._helpConstants.errorMessages.no_records);

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
                dependencies: gs.getMessage('Dependency deleted successfully'),
            }
        };
    },

    reorder: function(setupId, data) {
        if (!setupId || !data)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Missing setup ID or data"));
        var setupController = new SNHelpSetupController();
        return setupController.reorder(setupId, data);
    },

    addInteractionLog: function(setupId, stepId, data) {
        var result = {};
        var setupController = new SNHelpSetupController();

        if (!setupId)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid setupId {0} ", setupId));
        if (!stepId)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid stepId {0} ", stepId));
        if (data && !data.action)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Mising required parameter - action"));
        if (!this.setupUtil.isValidAction(data.action))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid Action - {0}", data.action));

        if (this.setupService.isValidSetupId(setupId)) {
            result = setupController.addInteractionLog(setupId, stepId, data);
            if (result.data) {
                result.status = result.status || 201;
            }
        } else {
            result.status = 404;
            result.message = gs.getMessage("Can't find setup with sys_id {0}", setupId);
        }

        return result;
    },

    setGuidanceAutoComplete: function(sys_id, interactionId) {
        var interaction, setupController;

        if (!sys_id)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid sys_id {0}", sys_id));

        setupController = new SNHelpSetupController();

        interaction = setupController.setGuidanceAutoComplete(sys_id, interactionId);

        if (!interaction)
            return this.serviceError(this._helpConstants.httpStatus.NOT_FOUND, this._helpConstants.errorMessages.no_records);

        return {
            status: this._helpConstants.httpStatus.SUCCESS,
            data: {
                interaction: interaction
            }
        };
    },
    upsertInteraction: function(setupId, params) {
        if (!setupId)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid setupId {0}", setupId));
        if (!(params && params.active_setup_type))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Missing required parameter active_setup_type"));
        var setupController = new SNHelpSetupController();

        return setupController.upsertInteraction(setupId, params.active_setup_type);
    },

    configurePluginsForSetupType: function(setupId, pluginCategory, params) {
        if (!setupId || !GlideStringUtil.isEligibleSysID(setupId))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid setup id {0}", setupId));
        if (!pluginCategory || !GlideStringUtil.isEligibleSysID(pluginCategory))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid plugin category {0}", setupId));
        if (!params || Object.keys(params).length === 0)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Plugin configuration details is not provided"));

        var setupController = new SNHelpSetupController();
        return setupController.configurePluginsForSetupType(setupId, pluginCategory, params);
    },

    getPluginsBySetupType: function(setupId, pluginCategory) {
        if (!setupId || !GlideStringUtil.isEligibleSysID(setupId))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid setup id {0}", setupId));
        if (!pluginCategory || !GlideStringUtil.isEligibleSysID(pluginCategory))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid plugin category {0}", setupId));

        var setupController = new SNHelpSetupController();
        return setupController.getPluginsBySetupType(setupId, pluginCategory);
    },

    upsertStepInputInInteractionStepTable: function(stepId, params) {
        if (!stepId)
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid stepId {0}", stepId));
        if (!(params && params.step_input))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Missing required parameter step_input"));
        var setupController = new SNHelpSetupController();

        return setupController.upsertStepInputInInteractionStepTable(stepId, params);
    },

    createInteractionForGuidedSetup: function(setupId, reqParams) {
        if (!setupId || !GlideStringUtil.isEligibleSysID(setupId))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid setup id {0}", setupId));

        var setupController = new SNHelpSetupController();
        return setupController.createInteractionForGuidedSetup(setupId, reqParams);
    },

    getPDLaneDescriptions: function(contextLaneSysIds) {
        if (!contextLaneSysIds) {
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Missing required parameter context_lane_sys_ids"));
        }
        var setupController = new SNHelpSetupController();
        return setupController.getPDLaneDescriptions(contextLaneSysIds);
    },

    contextHandler: function(setupId, data) {
        if (!setupId || !GlideStringUtil.isEligibleSysID(setupId))
            return this.serviceError(this._helpConstants.httpStatus.BAD_REQUEST, gs.getMessage("Invalid setup id {0}", setupId));

        var playerController = new sn_ads_setup.SNHelpSetupPlayerController();
        var interactionId = data && data.interaction_id || '';
        return playerController.getInteractionDetails(setupId, interactionId);
    },

    serviceError: function(status, errorMessage) {
        this._helpUtil.setError(this.type, errorMessage);
        return {
            status: status,
            error: errorMessage
        };
    },

    type: 'SNHelpSetupRestHandler'
};
