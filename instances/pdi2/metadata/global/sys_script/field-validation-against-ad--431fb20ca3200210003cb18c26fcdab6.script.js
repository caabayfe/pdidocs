(function executeRule(current, previous /*null when async*/ ) {

    var grEntity = new GlideRecord("promin_project_entity");
    grEntity.addQuery("project", current.project);
    grEntity.addNullQuery("parent_entity");
    grEntity.query();
    if (grEntity.next()) {
        try {
            if (!grEntity.getValue("enable_touch_point") &&
                (current.getValue("type") == "EXTREME_NODE_TOUCH_POINT" ||
                    current.getValue("type") == "NODE_TOUCH_POINT_OUTLIER")) {
                throw gs.getMessage("The finding is based on touch point metric which is not enabled for the parent table configuration");
            }
            var grActivity = new GlideRecord("promin_activity_def");
            grActivity.addQuery("entity", grEntity.getUniqueValue());
            grActivity.addQuery("field", current.field);
            grActivity.query();
            if (grActivity.next()) {
                var activityRecordLink = '<a href="' + grActivity.getLink() + '" target="_blank">here</a>';
                if (grActivity.getValue("type") != "DEFAULT") {
                    throw gs.getMessage('Automated findings can only be configured on activities of type "All field values (Default)". "{0}" is an activity of type {1} in this project. Please update it {2} before configuring this automated finding definition.', [current.field, grActivity.getDisplayValue("type"), activityRecordLink]);
                } else if (grActivity.getValue("track_change") == true) {
                    throw gs.getMessage('Automated findings can only be configured on activities of type "All field values (Default)" that are not grouped. "{0}" is a grouped activity in this project. Please update it {1} before configuring this automated finding definition.', [current.field, activityRecordLink]);
                } else if (grActivity.getValue("activity_of_interest") == true) {
                    throw gs.getMessage('Automated findings can only be configured on activities of type "All field values (Default)" that are not contextual activities. "{0}" is a contextual activity in this project. Please update it {1} before configuring this automated finding definition.', [current.field, activityRecordLink]);
                }
            } else {
                throw gs.getMessage('Automated findings can only be configured on activities present in this project. There is no activity definition for the field: "{0}". Please create one before configuring this automated finding definition.', current.field);
            }
        } catch (err) {
            gs.addErrorMessage(err);
            current.setAbortAction(true);
            action.setRedirectURL(current);
        }
    }

})(current, previous);
