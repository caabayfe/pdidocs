(function executeRule(current, previous /*null when async*/ ) {

    if (current.getValue('target') != null) {
        var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        goalRelationshipGr.addQuery('entity_id', current.getValue('entity_id'));
        goalRelationshipGr.addQuery('goal', current.getValue('goal'));
        goalRelationshipGr.addQuery('target', "null");
        goalRelationshipGr.query();
        if (goalRelationshipGr.next()) {
            if (goalRelationshipGr.getValue('is_primary_goal') == true) {
                goalRelationshipGr.setValue("is_primary_goal", false);
                goalRelationshipGr.update();
                current.setValue("is_primary_goal", true);
                current.update();
            }
            goalRelationshipGr.deleteRecord();
        }
    }

})(current, previous);
