(function(file) {

    // The application file being operated on is called 'file'. The function must return a boolean. If true, the application file will use this editor configuration.
    /*
    Open in Table Builder, only if flow trigger type is record trigger and has table set.
    */

    var isValidFlowTable = function() {
        return sn_flow.AssociatedFlows.isFlowHasTableTrigger(file.sys_id);
    };

    return isValidFlowTable();

})(globalFileObjectRecord);
