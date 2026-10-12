gs.include('WorkflowElementVersionUtils');
var publishedId = new WorkflowElementVersionUtils().publish(current);

// now redirect to the published version
var view = new SNC.DataStructureAPI(current.base_provider.name + "").getProviderSetting("view");
if (!view)
	view = "";
// if we have a view, append  + "&sysparm_view=activity_creator" after the publishedId
gs.setRedirect("wf_element_activity.do?sys_id=" + publishedId + "&sysparm_view_forced=true&sysparm_view=" + view);
