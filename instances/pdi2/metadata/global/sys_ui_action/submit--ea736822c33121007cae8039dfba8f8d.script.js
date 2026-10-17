gs.include('WorkflowElementVersionUtils');
var eUtils = new WorkflowElementVersionUtils();
var gr = eUtils.submit(current);

// now redirect to the checkout version
//gs.setRedirect("wf_element_activity.do?sys_id=" + gr.sys_id);
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);

// if we have a view.. add  + "&sysparm_view=activity_creator" after the sys_id
var view = new SNC.DataStructureAPI(current.base_provider.name + "").getProviderSetting("view");
if (!view)
	view = "";
gs.setRedirect("wf_element_activity.do?sys_id=" + current.sys_id + "&sysparm_view_forced=true&sysparm_view=" + view);
