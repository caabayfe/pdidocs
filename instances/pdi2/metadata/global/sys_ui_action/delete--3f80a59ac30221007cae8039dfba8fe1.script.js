gs.include('WorkflowElementVersionUtils');

var prevElemId = new WorkflowElementVersionUtils().deleteIt(current);

// now redirect to the previously published version
if (prevElemId)
	gs.setRedirect("wf_element_activity.do?sys_id=" + prevElemId);
else
	gs.setRedirect("wf_element_activity.do");
