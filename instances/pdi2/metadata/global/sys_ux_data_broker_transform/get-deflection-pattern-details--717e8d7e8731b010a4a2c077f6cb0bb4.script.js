function transform(input) {

    function getActivityPatternDetails(sysId) {
        var activityPatternGR = new GlideRecord('ssa_activity_pattern');
        activityPatternGR.addQuery("sys_id", sysId);
        activityPatternGR.query();
        var patternData = {};
        if (activityPatternGR.next()) {
            patternData.name = activityPatternGR.getValue("name");
            patternData.outcome = activityPatternGR.getValue("outcome");
            patternData.activity_table = activityPatternGR.primary_activity.activity_source_table.getValue();
            patternData.feed_conditions = activityPatternGR.primary_activity.feed_conditions.getValue();
        }
        return patternData;
    }

    function getDeflectionConfigDetails(sysId) {
        var deflection_configuration_GR = new GlideRecord('ssa_deflection_configuration');
        deflection_configuration_GR.addQuery("sys_id", sysId);
        deflection_configuration_GR.query();
        if (deflection_configuration_GR.next()) {
            return {
                "id": sysId,
                "name": deflection_configuration_GR.getDisplayValue("name")
            };
        }
        return "";
    }

    function getApplicationScope(dfConfigId, patternId) {
        var gr = new GlideRecord("ssa_deflection_pattern");
        gr.addQuery('deflection_configuration', dfConfigId);
        gr.addQuery('activity_pattern', patternId);
        gr.query();
        if (gr.next()) {
            return gr.getDisplayValue("sys_scope");
        }
        return "";
    }

    var response = {
        "name": "",
        "outcome": "20",
        "primary_activity_table": "--None--",
        "filter_conditions": "",
        "deflection_config_name": "",
        "deflection_config_id": "",
        "alert": "",
        "outcome_choices": GlideScriptChoiceList.getChoiceList('ssa_activity_pattern', 'outcome')
    };

    var activityPatternId = input.activityPatternId;
    var deflectionConfigId = input.deflectionConfigId;
    var defConfigDetails = getDeflectionConfigDetails(deflectionConfigId);
    if (defConfigDetails != "") {
        response["deflection_config_name"] = defConfigDetails.name;
        response["deflection_config_id"] = defConfigDetails.id;
    }

    if (activityPatternId != "-1") {
        var userScope = gs.getCurrentApplicationId();
        userScope = userScope == 'rhino.global' ? 'global' : userScope;
        var recordScope = getApplicationScope(defConfigDetails.id, activityPatternId);
        var clickHereLink = "/ssa_activity_pattern.do?sys_id=" + activityPatternId;
        if (userScope != 'global' || recordScope != 'Global')
            response["alert"] = gs.getMessage("<p>This record is in the {0} application. To edit this record click " + '<a href = {1} target = "_blank" style = "color:RGB(1,89,107)">here</a><p>', [recordScope, clickHereLink]);

        var activityPatternDetails = getActivityPatternDetails(activityPatternId);
        if (activityPatternDetails) {
            response["name"] = activityPatternDetails.name;
            response["outcome"] = activityPatternDetails.outcome;
            response["primary_activity_table"] = activityPatternDetails.activity_table;
            response["filter_conditions"] = activityPatternDetails.feed_conditions;
        }
    }

    return response;
}
