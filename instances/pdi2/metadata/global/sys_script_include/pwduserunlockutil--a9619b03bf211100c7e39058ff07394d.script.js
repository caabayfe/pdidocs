var PwdUserUnlockUtil = Class.create();
PwdUserUnlockUtil.prototype = {

    GET_ACCOUNT_LOCK_STATE_MASTER_WORKFLOW: "Pwd Get Lock State - Master",
    UNLOCK_ACCOUNT_MASTER_WORKFLOW: "Pwd Unlock Account - Master",

    STATUS_INVALID: 'invalid',
    STATUS_UNVERIFIED: 'unverified',
    STATUS_FAILURE: 'failure',
    STATUS_PENDING: 3,
    GET_LOCK_STATE_ACTION: '4',
    UNLOCK_ACCOUNT_ACTION: '3',

    trackingMgr: new SNC.PwdTrackingManager(),

    initialize: function() {},

    startGetLockStateWorkflow: function(requestId, userId) {
        return this._startWF(this.GET_ACCOUNT_LOCK_STATE_MASTER_WORKFLOW, requestId, userId, true, this.GET_LOCK_STATE_ACTION);
    },

    startGetLockStateWorkflowNoVerification: function(requestId, userId) {
        var isRequestInvalid = new SNC.PwdTrackingManager().isRequestInvalid(requestId);
        if (!isRequestInvalid) {
            return this._startWF(this.GET_ACCOUNT_LOCK_STATE_MASTER_WORKFLOW, requestId, userId, false, this.GET_LOCK_STATE_ACTION);
        }
        return this.STATUS_INVALID;
    },

    startUnlcokWorkflow: function(requestId, userId) {
        return this._startWF(this.UNLOCK_ACCOUNT_MASTER_WORKFLOW, requestId, userId, true, this.UNLOCK_ACCOUNT_ACTION);
    },

    _startWF: function(wfName, requestId, userId, verifyRequest, action) {
        var pwdFlowHelper = new PwdFlowHelper();

        if (verifyRequest && !this.trackingMgr.requestVerified(requestId))
            return this.STATUS_UNVERIFIED;

        if (wfName == this.UNLOCK_ACCOUNT_MASTER_WORKFLOW)
            this._updateRequestAction(requestId, '2');

        var outputs = pwdFlowHelper.startMasterSubFlow(requestId, '', '', action);

        if ((outputs.is_flow == false && outputs.context_id == undefined) || (outputs.is_flow == true && outputs.status == "Error")) {
            // Update the request record with 'failure'
            var req = new GlideRecord('pwd_reset_request');
            if (req.get(requestId)) {
                req.lock_state = -1; // failure
                req.update();
            }
            return this.STATUS_FAILURE;
        }

        if (outputs.status == "Pending") {
            new SNC.PwdTrackingManager().updateRequestStatus(requestId, this.STATUS_PENDING);
            gs.getSession().putProperty('async_pwd_request', 'true');
        }

        return outputs.is_flow == true ? outputs : outputs.context_id.sys_id;
    },

    getLockStateFromRequest: function(reqeustId) {
        var lockState = 0; // unknown

        var gr = new GlideRecord('pwd_reset_request');
        if (gr.get(reqeustId)) {
            lockState = gr.getValue('lock_state');
        }

        return lockState;
    },

    _updateRequestAction: function(requestId, value) {
        var gr = new GlideRecord('pwd_reset_request');
        if (gr.get(requestId)) {
            gr.setValue('action_type', value);
            gr.update();
        }
    },

    type: 'PwdUserUnlockUtil'
};
