var PwdAjaxVerifyIdentityServiceDesk = Class.create();

PwdAjaxVerifyIdentityServiceDesk.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    pwdIdentifyHandler: new global.PwdIdentifyStageHandler(),

    clearUserEmail: function() {
        gs.getSession().putProperty('sysparm_user_email', '');
    },

    isPublic: function() {
        return false;
    },

    getProcessNamesAsync: function() {
        var userId = this.getParameter('sysparm_user');
        if (gs.nil(userId))
            return;

        var processes = this.pwdIdentifyHandler.getProcessesForUser(userId);

        for (var i = 0; i < processes.length; i++) {
            var processInfo = processes[i];

            if (!gs.nil(processInfo.procName)) {
                var process = this.newItem("process");
                process.setAttribute("name", processInfo.procName);
                process.setAttribute("procSysId", processInfo.procSysId);
            }
        }
    },

    /* eslint-disable consistent-return */
    saveAndProceed: function() {
        var userSysId = this.getParameter('sysparm_user_id');
        var processSysId = this.getParameter('sysparm_procSysId');

        var pwdResetRespUtilityObj = this.pwdIdentifyHandler.identifyUserForServiceDesk(userSysId, processSysId);
        var status = pwdResetRespUtilityObj.isError() ? pwdResetRespUtilityObj.getStatusMessage() : PwdConstants.SUCCESS;

        var result = this.newItem("result");
        result.setAttribute("status", status);
        return status;
    },

    type: 'PwdAjaxVerifyIdentityServiceDesk'
});
