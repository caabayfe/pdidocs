var SOWListContextActionAccessHandlerITSMSNC = Class.create();
SOWListContextActionAccessHandlerITSMSNC.prototype = {
    SUPPORTED_ACTIONS: ['reassign'],

    checkAccess: function(table, sysId, actionId) {
        var gr = new GlideRecord(table);
        if (!gr.get(sysId)) {
            gs.error("Record not found: " + table + ", sysId: " + sysId);
            return;
        }
        var outputObj = {
            canAccess: false,
            errorMessage: ""
        };

        switch (actionId) {
            case "reassign":
                if (!gr.active) {
                    outputObj.errorMessage = gs.getMessage("{0} cannot be reassigned. It is inactive.", gr.number);
                } else if (!gr.assigned_to.canWrite() || !gr.assignment_group.canWrite()) {
                    outputObj.errorMessage = gs.getMessage("{0} cannot be reassigned. You do not have permission to reassign.", gr.number);
                } else
                    outputObj.canAccess = true;
                break;
        }
        return outputObj;
    },

    handles: function(actionId) {
        return this.SUPPORTED_ACTIONS.indexOf(actionId) != -1;
    },

    type: 'SOWListContextActionAccessHandlerITSMSNC'
};
