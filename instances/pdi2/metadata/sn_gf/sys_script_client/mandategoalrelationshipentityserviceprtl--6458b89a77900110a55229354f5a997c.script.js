function onLoad() {
    var queryString = this.location.search;
    var urlParams = new URLSearchParams(queryString);
    if (urlParams.get("query")) { // New Goal Relationship record
        var queryParam = urlParams.get("query").split("^")[1];
        var workItemType = "";
        var isNotEmptyTextIndex = queryParam.indexOf("ISNOTEMPTY");
        if (isNotEmptyTextIndex > -1)
            workItemType = queryParam.substring(0, isNotEmptyTextIndex);
        else if (queryParam == "planning_item_idISEMPTY")
            workItemType = "other_item_id";
		else if(queryParam.startsWith("planning_item_typeIN"))
			workItemType = "planning_item_id";
    } else if (urlParams.get("relationship_id")) { // Existing Goal Relationship record
        var relationshipIdParam = urlParams.get("relationship_id").split(":")[1];
    }

    var relationshipIdGoalRelViewMapping = {
        "364af774532130103913ddeeff7b12e0": "goal_project_relationship",
        "b1ea7f74532130103913ddeeff7b124d": "goal_demand_relationship",
        "f87bf7b4532130103913ddeeff7b1210": "goal_program_relationship",
        "787db1f853b53010c8d4ddeeff7b12b7": "goal_epic_relationship",
        "e2e2864577230110044e6e7f6b5a9908": "goal_planning_item_relationship",
        "a61796a077120110a55229354f5a9982": "Goal_Other_Item_Relationship"
    };
    var workItemGoalRelViewMapping = {
        "project": "goal_project_relationship",
        "demand": "goal_demand_relationship",
        "program": "goal_program_relationship",
        "scrum_epic": "goal_epic_relationship",
        "planning_item_id": "goal_planning_item_relationship",
		"other_item_id": "Goal_Other_Item_Relationship"
    };
    var view = relationshipIdParam ? relationshipIdGoalRelViewMapping[relationshipIdParam] : workItemGoalRelViewMapping[workItemType];

    if (view == "goal_project_relationship") {
        g_form.setMandatory("project", true);
        g_form.setDisabled("goal", true);
        g_form.isNewRecord() ? g_form.setReadOnly("project", false) : g_form.setReadOnly("project", true);
    } else if (view == "goal_demand_relationship") {
        g_form.setMandatory("demand", true);
        g_form.setDisabled("goal", true);
        g_form.isNewRecord() ? g_form.setReadOnly("demand", false) : g_form.setReadOnly("demand", true);
    } else if (view == "goal_program_relationship") {
        g_form.setMandatory("program", true);
        g_form.setDisabled("goal", true);
        g_form.isNewRecord() ? g_form.setReadOnly("program", false) : g_form.setReadOnly("program", true);
    } else if (view == "goal_epic_relationship") {
        g_form.setMandatory("scrum_epic", true);
        g_form.setDisabled("goal", true);
        g_form.isNewRecord() ? g_form.setReadOnly("scrum_epic", false) : g_form.setReadOnly("scrum_epic", true);
    } else if (view == "goal_feature_relationship") {
        g_form.setMandatory("scrum_feature", true);
        g_form.setDisabled("goal", true);
        g_form.isNewRecord() ? g_form.setReadOnly("scrum_feature", false) : g_form.setReadOnly("scrum_feature", true);
    } else if (view == 'goal_planning_item_relationship') {
        g_form.setMandatory('planning_item_id', true);
        g_form.isNewRecord() ? g_form.setReadOnly("planning_item_type", false) : g_form.setReadOnly("planning_item_type", true);
        g_form.setDisabled("goal", true);
        g_form.isNewRecord() ? g_form.setReadOnly("planning_item_id", false) : g_form.setReadOnly("planning_item_id", true);
    } else if (view == 'Goal_Other_Item_Relationship') {
        g_form.setMandatory('table_name', true);
        g_form.setMandatory('entity_id', true);
        g_form.isNewRecord() ? g_form.setReadOnly("table_name", false) : g_form.setReadOnly("table_name", true);
        g_form.isNewRecord() ? g_form.setReadOnly("entity_id", false) : g_form.setReadOnly("entity_id", true);
        g_form.setDisabled("goal", true);
    } else if (view == "project_goal_relationship") {
        g_form.setMandatory('project', true);
        g_form.setDisabled('project', true);
        g_form.isNewRecord() ? g_form.setReadOnly("goal", false) : g_form.setReadOnly("goal", true);
    } else if (view == "demand_goal_relationship") {
        g_form.setMandatory("demand", true);
        g_form.setDisabled("demand", true);
        g_form.isNewRecord() ? g_form.setReadOnly("goal", false) : g_form.setReadOnly("goal", true);
    } else if (view == "program_goal_relationship") {
        g_form.setMandatory("program", true);
        g_form.setDisabled("program", true);
        g_form.isNewRecord() ? g_form.setReadOnly("goal", false) : g_form.setReadOnly("goal", true);
    } else if (view == "epic_goal_relationship") {
        g_form.setMandatory("scrum_epic", true);
        g_form.setDisabled("scrum_epic", true);
        g_form.isNewRecord() ? g_form.setReadOnly("goal", false) : g_form.setReadOnly("goal", true);
    } else if (view == "feature_goal_relationship") {
        g_form.setMandatory("scrum_feature", true);
        g_form.setDisabled("scrum_feature", true);
        g_form.isNewRecord() ? g_form.setReadOnly("goal", false) : g_form.setReadOnly("goal", true);
    } else if (view == "planning_item_goal_relationship") {
        g_form.setMandatory("planning_item_id", true);
        g_form.setDisabled("planning_item_id", true);
        g_form.isNewRecord() ? g_form.setReadOnly("goal", false) : g_form.setReadOnly("goal", true);
    } else if (view == "other_item_goal_relationship") {
        g_form.setMandatory("table_name", true);
        g_form.setDisabled("table_name", true);
        g_form.setMandatory("entity_id", true);
        g_form.setDisabled("entity_id", true);
        g_form.isNewRecord() ? g_form.setReadOnly("goal", false) : g_form.setReadOnly("goal", true);
    }

}
