gs.include('WorkflowElementVersionUtils');
var saveId = new WorkflowElementVersionUtils().save(current);

var view = new SNC.DataStructureAPI(current.base_provider.name + "").getProviderSetting("view");
if (!view)
	view = "";

gs.setRedirect("wf_element_activity.do?sys_id=" + saveId + "&sysparm_view_forced=true&sysparm_view=" + view);
