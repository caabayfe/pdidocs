function onLoad() {
    var view = g_form.getViewName();

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

    if (!g_form.isNewRecord() && g_form.getValue("is_primary_goal") == "true")
        g_form.setDisabled("is_primary_goal", true);
}
