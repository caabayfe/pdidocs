doAssignToMe();
function doAssignToMe() {
	var workItemGR = new GlideRecord('awa_work_item');
	workItemGR.addQuery('document_table', 'interaction');
	workItemGR.addQuery('document_id', current.getUniqueValue());
	workItemGR.addActiveQuery();
	workItemGR.query();
	
	if (workItemGR.next()) {
		workItemGR.setValue('assigned_to', gs.getUserID());
		workItemGR.setValue('state', 'accepted');
		workItemGR.update();
	}
	current.assigned_to = gs.getUserID();
	current.update();
}
