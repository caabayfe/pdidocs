gs.include('WorkflowElementVersionUtils');
var eUtils = new WorkflowElementVersionUtils();

var checkedOutId = eUtils.forceCheckout(current);

var view = new SNC.DataStructureAPI(current.base_provider.name + "").getProviderSetting("view");
if (!view)
	view = "";

// now redirect to the checkout version
gs.setRedirect("wf_element_activity.do?sys_id=" + checkedOutId + "&sysparm_view_forced=true&sysparm_view=" + view);
