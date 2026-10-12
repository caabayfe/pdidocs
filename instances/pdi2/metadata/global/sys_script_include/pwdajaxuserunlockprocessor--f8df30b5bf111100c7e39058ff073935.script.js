/*
 * Class is a Ajax processor which handles password reset workflow related functionality.
 */
var PwdAjaxUserUnlockProcessor = Class.create();
PwdAjaxUserUnlockProcessor.prototype = Object.extendsObject(PWDWFProcessorBase, {

    BL: new PwdUserUnlockUtil(),
    RESET_REQUEST_VERIFIED: '2',

    // This function makes this AJAX public. By default, all AJAX server side is private.
    isPublic: function() {
        return true;
    },

    // ---------------------------------------------------------------------------------
    // ------------- Handle the retrieval of the account lock status : -----------------
    // ---------------------------------------------------------------------------------


    // This AJAX function returns the wf status based upon the wf_context table.
    /* eslint-disable consistent-return */
    pollLockStateFromRequest: function() {
        if (!this._validateSecurity())
            return;

        var requestId = this.getParameter("sysparam_request_id");
        var requestGr = new GlideRecord('pwd_reset_request');
        if (requestGr.get(requestId) && requestGr.status == this.RESET_REQUEST_VERIFIED)
            return this.BL.getLockStateFromRequest(requestId);
        else
            return;
    },
    /* eslint-enable consistent-return */


    // This AJAX function starts a workflow that checks the user's lock state.
    // In case of an exception, will send an error message back to client.
    initiateGetLockStateWF: function() {
        if (!this._validateSecurity())
            return;

        var requestId = this.getParameter("sysparam_request_id");
        var userId = gs.getSession().getProperty('sysparm_sys_user_id');
        var LOG_ID = "[PwdAjaxUserUnlockProcessor:initiateGetLockStateWF] ";

        var result = this.BL.startGetLockStateWorkflow(requestId, userId);

        this._processResult(result, requestId, LOG_ID, this.BL.GET_ACCOUNT_LOCK_STATE_MASTER_WORKFLOW);
    },

    // This AJAX function returns the wf status based upon the wf_context table.
    checkGetLockStateWFState: function() {
        // check the security before anything else.
        if (!this._validateSecurity())
            return;

        var ctxId = this.getParameter('sysparam_wf_context_sys_id');

        var flowData = PWDWorkflowHelper.getWorkflowData(ctxId, false);

        var response = this.newItem("response");
        response.setAttribute("state", flowData.state);
        response.setAttribute("result", flowData.result);
    },

    // ---------------------------------------------------------------------------------
    // ------------------------ Handle the account unlocking: --------------------------
    // ---------------------------------------------------------------------------------

    // This AJAX function starts a workflow that unlocks the account:
    initiateUnlockWF: function() {
        if (!this._validateSecurity())
            return;

        var LOG_ID = "[PwdAjaxUserUnlockProcessor:initiateUnlockWF] ";
        var requestId = this.getParameter("sysparam_request_id");
        var userId = gs.getSession().getProperty('sysparm_sys_user_id');

        var result = this.BL.startUnlcokWorkflow(requestId, userId);

        this._processResult(result, requestId, LOG_ID, this.BL.UNLOCK_ACCOUNT_MASTER_WORKFLOW);
    },


    // This AJAX function returns the wf status based upon the wf_context table:
    checkUnlockWFState: function() {
        // check the security before anything else.
        if (!this._validateSecurity())
            return;

        var ctxId = this.getParameter("sysparam_wf_context_sys_id");

        var flowData = PWDWorkflowHelper.getWorkflowData(ctxId);

        var response = this.newItem("response");
        response.setAttribute("state", flowData.state);
        response.setAttribute("result", flowData.result);

        // If workflow is finished, pass additional workflow results:
        if (flowData.state.match(/finished/i)) {
            this.createContextItem(flowData.contextGr);
            this.createHistoryItems(flowData.historyGr);
            this._setResponseMessage("success", gs.getMessage("The request has been successfully completed"), ctxId);
        }
    },

    _processResult: function(result, requestId, logId, wfName) {
        var errorMsg, responseErrorMsg;

        if (result == this.BL.STATUS_UNVERIFIED) {
            errorMsg = logId + "Could not verify request: " + requestId;
            this.BL.trackingMgr.createActivity(PwdConstants.TYPE_WARNING, PwdConstants.STAGE_RESET, errorMsg, requestId);
            responseErrorMsg = gs.getMessage("The request is not verified. Please try again.");
            this._setResponseMessage("failure", responseErrorMsg, requestId);
        } else if (result == this.BL.STATUS_FAILURE) {
            errorMsg = logId + "Failed to start workflow: " + wfName;
            this.BL.trackingMgr.createActivity(PwdConstants.TYPE_ERROR, PwdConstants.STAGE_RESET, errorMsg, requestId);
            responseErrorMsg = gs.getMessage("Failed to start password reset process. Please contact the Password reset admin.");
            this._setResponseMessage("failure", responseErrorMsg, requestId);
        } else {
            this._setResponseMessage("success", "The request has been successfully completed", result /* ctxId*/ );
        }
    },

    type: PwdAjaxUserUnlockProcessor
});
