(function executeRule(current, previous /*null when async*/ ) {

    // Check whether the filter uses dot walking , unless it is Configration Item.Class/ Configuration Item.Name,
    //it is better not using the dot walking for performance issues

    var filterStr = current.alert_filter.toString();
    if (GlideStringUtil.nil(filterStr) || filterStr == "empty") {
        gs.addErrorMessage(gs.getMessage("The filter can not be empty, please change it"));
        current.setAbortAction(true);
        return;
    }
    var startPoint = 0;
    var dotPosition = filterStr.indexOf(".", startPoint);


    while (dotPosition != -1) {
        if (dotPosition >= 7 && filterStr.slice(dotPosition - 7, dotPosition) == "cmdb_ci") {
            if (filterStr.slice(dotPosition + 1, dotPosition + 5) == "name" || filterStr.slice(dotPosition + 1, dotPosition + 15) == "sys_class_name") {
                dotPosition = filterStr.indexOf(".", dotPosition + 1); //we want to go over all the not wanted dot walking in the filter
            } else {
                gs.addErrorMessage(gs.getMessage("The filter contains dot walking for Configuration Item. This is not recommended, as it can have a negative effect on performance."));
                return;
            }
        } else {
            gs.addErrorMessage(gs.getMessage("The filter contains dot walking. This is not recommended, as it can have a negative effect on performance."));
            return;
        }
    }

})(current, previous);
