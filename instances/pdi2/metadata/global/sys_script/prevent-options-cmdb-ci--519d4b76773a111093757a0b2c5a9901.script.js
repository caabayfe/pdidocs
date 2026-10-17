(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("cmdb_ci_service_auto");
    var utils = new TableUtils('cmdb_ci_service_auto');
    var serviceList = utils.getAllExtensions().toArray();
    for (var i = 0; i < serviceList.length; i++) {
        //Validating that cmdb_ci_class and cmdb_ci are not application service
        if (current.getValue('cmdb_ci_class') == serviceList[i]) {
            gs.addErrorMessage(gs.getMessage("'{0}' can’t be selected as Generic CI class. Please, select another CI class", current.cmdb_ci_class.getDisplayValue()));
            current.setAbortAction(true);
            break;
        } else {
            if (gr.get(current.cmdb_ci)) {
                gs.addErrorMessage(gs.getMessage("'{0}' is an Application service so it can’t be selected as Specific CI. Please, select another CI", current.cmdb_ci.getDisplayValue()));
                current.setAbortAction(true);
                break;
            }
        }
    }

})(current, previous);
