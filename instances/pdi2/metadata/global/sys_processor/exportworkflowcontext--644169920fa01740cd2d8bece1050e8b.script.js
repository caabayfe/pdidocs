var sysid = g_request.getParameter('sysparm_sys_id');
gs.log('** Exporting Workflow Context ' + sysid);
 
function getChildren(sysid) {
	var newsysids ='';
	gs.log ("gC('"+sysid+"')")
	var children = new GlideRecord('wf_context');
	children.addQuery('parent', 'IN', sysid);
	children.query();
	
	if(!children.hasNext())
		return "";
	
	while(children.next()) {
		newsysids += ','+children.getUniqueValue();
	}
	
	return newsysids + getChildren(newsysids);
}

var children = getChildren(sysid);
gs.log('Found following contexts ' + children);

var sysids = sysid + children;

// name all the related lists
var exporter = new ExportWithRelatedLists('wf_context', sysid);
exporter.addQuerySet('wf_context', 'sys_idIN' + children);
exporter.addQuerySet('wf_executing', 'contextIN' + sysids);
exporter.addQuerySet('wf_history', 'contextIN' + sysids);
exporter.addQuerySet('wf_history_scratchpad', 'contextIN' + sysids);
exporter.addQuerySet('wf_transition_history', 'contextIN' + sysids);
exporter.addQuerySet('wf_log', 'contextIN' + sysids);

//get activity IDS so  we can get variables from sys_variable_value for each activity
var activityIds = [];
var allActivities = new GlideRecord('wf_executing');
allActivities.addQuery('context', 'IN', sysids);
allActivities.query(); 
var activityIdsCondition = '';
while (allActivities.next()) {
    if (activityIdsCondition.length > 0)
        activityIdsCondition += ',';
    activityIdsCondition += allActivities.getValue('sys_id');
}

if (activityIdsCondition.length > 0){
   exporter.addQuerySet('sys_variable_value', 'document_keyIN' + activityIdsCondition);
}
exporter.exportRecords(g_response);
