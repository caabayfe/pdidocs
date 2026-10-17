var PwdFlowHelper = Class.create();
PwdFlowHelper.prototype = {
    LOCAL_CRED_TYPE: 'e611433fbf020100710071a7bf073921',
    CHANGE_PASSWORD_ACTION_TYPE: '4',
    GET_LOCK_STATE: '4',
    initialize: function() {},
    useFlow: function(procId) {
        var process = this._getProcess(procId);
        return process.cred_store.type.use_flow;
    },
    isDomainSepEnabled: function() {
        var pm = new GlidePluginManager();
        return pm.isActive('com.glide.domain') || pm.isActive('com.glide.domain.msp_extensions.installer');
    },
    startMasterSubFlow: function(requestId, newPassword, oldPassword, action) {
        var subflow_name = 'sn_pwdreset_ah.password_reset_master_subflow';
        var request = this._getRequest(requestId);
        var original_domain = gs.getSession().getCurrentDomainID();
        var inputs = {};
        inputs['password_reset_request'] = request;
        inputs['new_password'] = newPassword;
        inputs['current_password'] = oldPassword;
        inputs['action'] = action;

        if (this.isDomainSepEnabled()) {
            var req_user = GlideUser.getUserByID(request.user);
            gs.getSession().setDomainID(req_user.getDomainID());
        }

        if (this._isChangeRequestandLocalCredType(request)) {
            subflow_name = 'sn_pwdreset_ah.password_change_master_subflow';
        }

        var outputs = "";
        /**
         * If it is a Get Lock State flow then the subflows are triggered Asynchronously, otherwise subflows are triggered synchronously like Reset Password, Change Password and Unlock Account flows.
         */
        outputs = (action == this.GET_LOCK_STATE) ? sn_fd.Subflow.startAsync(subflow_name, inputs) : this.startSubFlow(subflow_name, inputs);

        if (this.isDomainSepEnabled()) {
            gs.getSession().setDomainID(original_domain);
        }
        return outputs;
    },
    startConnectionTestSubFlow: function(cred_store_id) {
        var credStore = new GlideRecord('pwd_cred_store');
        credStore.get(cred_store_id);
        var inputs = {};
        var subflow = credStore.type.conn_test_flow;
        var subflow_name = subflow.sys_scope.scope.toString() + "." + subflow.internal_name.toString();
        return this.startSubFlow(subflow_name, inputs);
    },
    startSubFlow: function(subflow_name, inputs) {
        var result = sn_fd.FlowAPI.executeSubflow(subflow_name, inputs, 60000);
        return result;
    },
    _getRequest: function(requestId) {
        var request = new GlideRecord('pwd_reset_request');
        request.get(requestId);
        return request;
    },

    _getProcess: function(procId) {
        var process = new GlideRecord('pwd_process');
        process.get(procId);
        return process;
    },

    _isChangeRequestandLocalCredType: function(resetRequest) {
        return (resetRequest.process.cred_store.type.equals(this.LOCAL_CRED_TYPE) && resetRequest.action_type.equals(this.CHANGE_PASSWORD_ACTION_TYPE));
    },

    type: 'PwdFlowHelper'
};
