gs.include("WorkflowElementVersionUtils");
var activityDef = new GlideRecord("wf_element_activity");
activityDef.addQuery("sys_id", current.activity_definition);
activityDef.query();
if (activityDef.next()) {
	var utils = new WorkflowElementVersionUtils();
	answer = utils.canSubmit(activityDef) || utils.canEdit(activityDef);
} else
	answer = true;
