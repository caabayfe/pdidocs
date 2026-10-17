var PwdResetUXFPreLoadValidationTask = Class.create();
PwdResetUXFPreLoadValidationTask.prototype = {
    initialize: function() {},

    retrievePwdResetOwner: function(table, sysID) {
        var ownerID = '';
        var taskHierarchy = new GlideTableHierarchy(table);
        if (taskHierarchy.getBase() === 'task') {
            var taskGR = new GlideRecord(table);
            if (taskGR.get(sysID)) {
                ownerID = taskGR.getValue("assigned_to");
            }
        }
        return ownerID;
    },


    type: 'PwdResetUXFPreLoadValidationTask'
};
