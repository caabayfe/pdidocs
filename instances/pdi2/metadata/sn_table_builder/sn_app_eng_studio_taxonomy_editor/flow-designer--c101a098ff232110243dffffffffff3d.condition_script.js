(function(file) {

    // The application file being operated on is called 'file'. The function must return a boolean. If true, the application file will use this editor configuration.
    // For a user without tables and forms delegated dev permission, flows should open in Flow Designer.

    var hasTablesAndFormsPermission = function() {
        return (gs.hasRightsTo('ui/configure.personalize_dictionary/write', null));
    };

    var isValidFlowTable = function() {
        return sn_flow.AssociatedFlows.isFlowHasTableTrigger(file.sys_id);
    };

    return !hasTablesAndFormsPermission() && isValidFlowTable();

})(globalFileObjectRecord);
