(function executeRule(current, previous /*null when async*/ ) {

    var startCondition = current.getValue("custom_start_condition");
    var endCondition = current.getValue("custom_end_condition");
    if (gs.nil(startCondition) && gs.nil(endCondition)) {
        current.setValue("advanced_condition_type", "NONE");
        current.setValue("advanced_condition_relation", "");
    } else {
        var type = current.getValue("advanced_condition_type");
        var relation = current.getValue("advanced_condition_relation");
        if (gs.nil(type) || type == "NONE") {
            //type cannot be blank, default to CROP
            current.setValue("advanced_condition_type", "CROP");
            current.setValue("advanced_condition_relation", "EVENTUALLY_FOLLOWED_BY");
        } else if (type == "CROP") {
            current.setValue("advanced_condition_relation", "EVENTUALLY_FOLLOWED_BY");
        } else if (type == "TRANSITION") {
            if (gs.nil(startCondition) || gs.nil(endCondition)) {
                gs.addErrorMessage(gs.getMessage("Both Process start / end condition are mandatory for type '{0}'", 
					[current.getDisplayValue("advanced_condition_type")]));
                current.setAbortAction(true);
                action.setRedirectURL(current);
                return;
            }
            if (gs.nil(relation)) {
                current.setValue("advanced_condition_relation", "EVENTUALLY_FOLLOWED_BY");
            }
        }
    }

})(current, previous);
