(function overrideView(view, is_list) {

    if (!is_list) {
        var uri = gs.action.getGlideURI();
        var sysId = uri.get('sys_id');
        var validGoalRelationshipViews = ["project_goal_relationship", "demand_goal_relationship", "program_goal_relationship", "epic_goal_relationship", "feature_goal_relationship", "planning_item_goal_relationship", "goal_project_relationship", "goal_demand_relationship", "goal_program_relationship", "goal_epic_relationship", "goal_feature_relationship", "goal_planning_item_relationship", "Goal_Other_Item_Relationship", "other_item_goal_relationship"];
        if (global.JSUtil.notNil(uri.get("sysparm_view")) && (new global.ArrayUtil()).contains(validGoalRelationshipViews, uri.get("sysparm_view"))) {
            answer = uri.get("sysparm_view");
            return;
        }
        var recordType = "";
        if (global.JSUtil.notNil(uri.get("query")) || global.JSUtil.notNil(uri.get("relationship_id"))) { // Business Planner
            if (global.JSUtil.notNil(uri.get("query"))) { // New Goal Relationship record
                var queryParam = uri.get("query").split("^")[1];
                var isNotEmptyTextIndex = queryParam.indexOf("ISNOTEMPTY");
                if (isNotEmptyTextIndex != -1)
                    recordType = "goal" + queryParam.substring(0, isNotEmptyTextIndex);
                else if (queryParam == "planning_item_idISEMPTY")
                    recordType = "goalother_item_id";
				else if(queryParam.startsWith("planning_item_typeIN"))
					recordType = "goalplanning_item_id";
            } else { // Existing Goal Relationship record
                var relationshipIdParam = uri.get("relationship_id").split(":")[1];
                var relationshipIdRecordTypeMapping = {
                    "364af774532130103913ddeeff7b12e0": "goalproject",
                    "b1ea7f74532130103913ddeeff7b124d": "goaldemand",
                    "f87bf7b4532130103913ddeeff7b1210": "goalprogram",
                    "787db1f853b53010c8d4ddeeff7b12b7": "goalscrum_epic",
                    "a61796a077120110a55229354f5a9982": "goalother_item_id",
                    "e2e2864577230110044e6e7f6b5a9908": "goalplanning_item_id"
                };
                recordType = relationshipIdRecordTypeMapping[relationshipIdParam];
            }
        } else if (global.JSUtil.notNil(uri.get("sysparm_record_list"))) {
            recordType = uri.get("sysparm_record_list").split("=")[0];
			if(recordType == "target")
				recordType = "goal";
            if (recordType == "goal") {
                var relationshipQuery = uri.get("sysparm_record_list").split("^")[1];
                isNotEmptyTextIndex = relationshipQuery.indexOf("ISNOTEMPTY");
                if (isNotEmptyTextIndex != -1)
                    recordType += relationshipQuery.substring(0, isNotEmptyTextIndex);
                else if (relationshipQuery == "planning_item_idISEMPTY")
                    recordType += "other_item_id";
				else if(relationshipQuery.startsWith("planning_item_typeIN"))
					recordType += "planning_item_id";
            } else {
                var goalRelGR = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
                if (goalRelGR.get(sysId)) {
                    if (goalRelGR.getValue("project"))
                        recordType = "project";
                    else if (goalRelGR.getValue("demand"))
                        recordType = "demand";
                    else if (goalRelGR.getValue("program"))
                        recordType = "program";
                    else if (goalRelGR.getValue("scrum_epic"))
                        recordType = "scrum_epic";
                    else if (goalRelGR.getValue("scrum_feature"))
                        recordType = "scrum_feature";
                    else if (goalRelGR.getValue("planning_item_id"))
                        recordType = "planning_item_id";
					else
						recordType = "entity_id";
                }
            }
        }
        var viewEntityJsonMap = {
            'project': 'project_goal_relationship',
            'demand': 'demand_goal_relationship',
            'program': 'program_goal_relationship',
            'scrum_epic': 'epic_goal_relationship',
            'scrum_feature': 'feature_goal_relationship',
            'planning_item_id': 'planning_item_goal_relationship',
			'entity_id': 'other_item_goal_relationship',
            'goalproject': 'goal_project_relationship',
            'goaldemand': 'goal_demand_relationship',
            'goalprogram': 'goal_program_relationship',
            'goalscrum_epic': 'goal_epic_relationship',
            'goalscrum_feature': 'goal_feature_relationship',
            'goalplanning_item_id': 'goal_planning_item_relationship',
            'goalother_item_id': 'Goal_Other_Item_Relationship'
        };
        answer = recordType in viewEntityJsonMap ? viewEntityJsonMap[recordType] : '';
    } else {
        answer = "";
    }

})(view, is_list);
