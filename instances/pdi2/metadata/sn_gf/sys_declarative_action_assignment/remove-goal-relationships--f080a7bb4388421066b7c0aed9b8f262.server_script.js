while (current.isValidRecord()) {
    var itemType;
    var itemId;
    var planningItemId = current.getValue("planning_item_id");
    if(planningItemId!= null){
        itemType = "planning_item_id";
        itemId = planningItemId;
    }
    else{
        itemType = "other_item_id";
        itemId = current.getValue("entity_id");
    }
    var goalRelObj = new sn_gf.GFGoalRelationship(current.getValue("goal"), GlidePluginManager.isActive('sn_gfa') ? current.getValue("target") : '', itemType, itemId);
    goalRelObj.deleteGoalRelationship();
    current.next();
}
