/*
 * Class is a Ajax processor which handles password reset workflow related functionality.
 */
var PwdAjaxWFRequestProcessor = Class.create();
PwdAjaxWFRequestProcessor.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {

    TYPE_INFO: "Info",
    TYPE_WARNING: "Warning",
    TYPE_ERROR: "Error",

    STAGE_RESET: "Reset",

    MASTER_WORKFLOW: "Pwd Reset - Master",

    validatePassword: function() {
        var processId = this.getParameter("sysparam_process_id");
        var newPasswd = this.getParameter("sysparam_new_password");
        var userName = GlideUser.getUserByID(gs.getSession().getProperty('sysparm_sys_user_id')).getName();
        var pwdWFRequestProcessor = new PwdWFRequestProcessor();
        var res = pwdWFRequestProcessor.validatePassword(processId, newPasswd, userName);

        return res;
    },

    validatePasswordForChange: function() {
        var processId = this.getParameter("sysparam_process_id");
        var newPasswd = this.getParameter("sysparam_new_password");
        var userName = gs.getUserName();
        var pwdWFRequestProcessor = new PwdWFRequestProcessor();
        var res = pwdWFRequestProcessor.validatePassword(processId, newPasswd, userName);

        return res;
    },


    /**
     * This function starts a master subflow. In case of an exception, will send an error
     * message back to client.
     */
    startWorkflow: function() {
        // check the security before anything else.
        // If any violation is found, then just return.
        if (!this._validateSecurity())
            return;

        var requestId = gs.getSession().getProperty('sysparm_request_id');
        if (gs.nil(requestId) || requestId != this.getParameter("sysparam_request_id"))
            return;

        var newPasswd = this.getParameter("sysparam_new_password");

        var pwdWFRequestProcessor = new PwdWFRequestProcessor();
        var res = pwdWFRequestProcessor.startWorkflow(requestId, newPasswd);

        this._setResponseMessage(res.status, res.message, res.value);
    },

    //To check if the execution is through workflow or flow.
    isFlow: function() {
        var pwdFlowHelper = new PwdFlowHelper();
        var procId = this.getParameter("sysparm_process_id");
        var result = pwdFlowHelper.useFlow(procId);
        return result;
    },

    /**
     * A synchronous AJAX function returns the wf status based upon the wf_context table.
     */
    /* eslint-disable consistent-return */
    getWorkflowStatus: function() {
        // check the security before anything else.
        // If any violation is found, then just return.
        var pwdFlowHelper = new PwdFlowHelper();
        if (!this._validateSecurity())
            return;

        var sysId = this.getParameter('sysparam_wf_context_sys_id');
        var state = 'failure';

        var gr = new GlideRecord('wf_context');
        if (gr.get(sysId)) {
            state = gr.getValue('state');
        }

        return state;
    },

    /**
     * This function makes this AJAX public. By default, all AJAX server side is private.
     */
    isPublic: function() {
        return true;
    },
    /* eslint-enable consistent-return */

    /**
     * Execute the post processor script include
     */
    runPostProcessor: function() {
        // check the security before anything else.
        // If any violation is found, then just return.
        if (!this._validateSecurity())
            return;

        var requestId = this.getParameter('sysparam_request_id');
        var workflowStatus = this.getParameter('sysparam_workflow_status');
        var processId = this.getParameter('sysparam_process_id');

        var pwdResetRespUtilityObj = new global.PwdResetStageHandler().runPostProcessorScript(requestId, processId, workflowStatus);
        var status = pwdResetRespUtilityObj.isError() ? "failure" : "success";
        this._setResponseMessage(status, pwdResetRespUtilityObj.getStatusMessage(), "");
    },

    _setResponseMessage: function(status, msg, value) {
        var response = this.newItem("response");
        response.setAttribute("status", status);
        response.setAttribute("message", msg);
        response.setAttribute("value", value);
    },

    checkMaximumAttempts: function() {
        var requestId = this.getParameter("sysparam_request_id");
        if (new PwdResetStageHandler().isMaxAttemptsReached(requestId)) {
            var activity = this.newItem('max_reset_attempts');
            activity.setAttribute('message', gs.getMessage('You have exceeded the maximum number of allowed reset attempt failures'));
        }
        this._setResponseMessage("Success", "Checked maximum attempts", "");
    },

    ajaxFunction_getWorkflowResult: function() {

        // check the security before anything else.
        // If any violation is found, then just return.
        var pwdFlowHelper = new PwdFlowHelper();

        if (!this._validateSecurity())
            return;

        var ctxId = this.getParameter("sysparam_wf_context_sys_id");
        var requestId = this.getParameter("sysparam_request_id");
        var wfData = new PwdResetStageHandler().getWFData(ctxId);
        this._getWFContext(wfData.context);
        this._getWFHistory(wfData.history);

        if (new PwdResetStageHandler().isMaxAttemptsReached(requestId)) {
            var activity = this.newItem('max_reset_attempts');
            activity.setAttribute('message', gs.getMessage('You have exceeded the maximum number of allowed reset attempt failures'));
        }
        this._setResponseMessage("success", gs.getMessage("The request has been successfully completed"), ctxId);
    },

    _getWFContext: function(context) {
        if (!gs.nil(context)) {
            var ctx = this.newItem('context');
            ctx.setAttribute('workflow', context.workflow);
            ctx.setAttribute('workflow_version', context.workflow_version);
            ctx.setAttribute('parent', context.parent);
            ctx.setAttribute('table', context.table);
            ctx.setAttribute('id', context.id);
            ctx.setAttribute('state', context.state);
            ctx.setAttribute('started', context.started);
            ctx.setAttribute('ended', context.ended);
            ctx.setAttribute('due', context.due);
            ctx.setAttribute('stage', context.stage);
            ctx.setAttribute('result', context.result);
            ctx.setAttribute('scratchpad', context.scratchpad);
            ctx.setAttribute('active', context.active);
            ctx.setAttribute('active_count', context.active_count);
            ctx.setAttribute('active_index', context.active_index);
            ctx.setAttribute('after_business_rules', context.after_business_rules);
            ctx.setAttribute('sys_id', context.sys_id);
            ctx.setAttribute('started_by', context.started_by);
            ctx.setAttribute('auto_start', context.auto_start);
            ctx.setAttribute('sys_domain', context.sys_domain);
            ctx.setAttribute('schedule', context.schedule);
            ctx.setAttribute('timezone', context.timezone);
            ctx.setAttribute('sys_id', context.sys_id);
            ctx.setAttribute('sys_updated_by', context.sys_updated_by);
            ctx.setAttribute('sys_updated_on', context.sys_updated_on);
            ctx.setAttribute('sys_created_by', context.sys_created_by);
            ctx.setAttribute('sys_created_on', context.sys_created_on);
            ctx.setAttribute('sys_domain', context.sys_domain);
            ctx.setAttribute('sys_mod_count', context.sys_mod_count);
        }
    },

    _getWFHistory: function(historyArray) {
        for (var i = 0; i < historyArray.length; i++) {
            var history = historyArray[i];
            this._getWFActivity(history.activity);
            var historyItem = this.newItem('history');
            historyItem.setAttribute('workflow_version', history.workflow_version);
            historyItem.setAttribute('context', history.context);
            historyItem.setAttribute('activity', history.activity.sys_id);
            historyItem.setAttribute('parent', history.parent);
            historyItem.setAttribute('is_parent', history.is_parent);
            historyItem.setAttribute('started', history.started);
            historyItem.setAttribute('ended', history.ended);
            historyItem.setAttribute('due', history.due);
            historyItem.setAttribute('state', history.state);
            historyItem.setAttribute('activity_result', history.activity_result);
            historyItem.setAttribute('fault_description', history.fault_description);
            historyItem.setAttribute('output', history.output);
            historyItem.setAttribute('activity_index', history.activity_index);
            historyItem.setAttribute('rolled_back_by', history.rolled_back_by);
            historyItem.setAttribute('sys_domain', history.sys_domain);
            historyItem.setAttribute('sys_updated_by', history.sys_updated_by);
            historyItem.setAttribute('sys_updated_on', history.sys_updated_on);
            historyItem.setAttribute('sys_created_by', history.sys_created_by);
            historyItem.setAttribute('sys_created_on', history.sys_created_on);
            historyItem.setAttribute('sys_mod_count', history.sys_mod_count);
            historyItem.setAttribute('sys_id', history.sys_id);
        }
    },

    /* eslint-disable no-unused-vars */
    _getWFActivity: function(activity) {
        if (!gs.nil(activity)) {
            var activityItem = this.newItem('activity');
            activityItem.setAttribute('name', activity.name);
            activityItem.setAttribute('state', activity.state);
            activityItem.setAttribute('activity_definition', activity.activity_definition);
            activityItem.setAttribute('workflow_version', activity.workflow_version);
            activityItem.setAttribute('stage', activity.stage);
            activityItem.setAttribute('x', activity.x);
            activityItem.setAttribute('y', activity.y);
            activityItem.setAttribute('height', activity.height);
            activityItem.setAttribute('width', activity.width);
            activityItem.setAttribute('parent', activity.parent);
            activityItem.setAttribute('vars', activity.vars);
            activityItem.setAttribute('timeout', activity.timeout);
            activityItem.setAttribute('sys_domain', activity.sys_domain);
            activityItem.setAttribute('sys_id', activity.sys_id);
            activityItem.setAttribute('sys_updated_by', activity.sys_updated_by);
            activityItem.setAttribute('sys_updated_on', activity.sys_updated_on);
            activityItem.setAttribute('sys_created_by', activity.sys_created_by);
            activityItem.setAttribute('sys_created_on', activity.sys_created_on);
            activityItem.setAttribute('sys_mod_count', activity.sys_mod_count);
        }
    },

    /* eslint-enable no-unused-vars */

    type: PwdAjaxWFRequestProcessor
});
