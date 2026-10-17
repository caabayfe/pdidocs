deleteElementActivity();

function deleteElementActivity() {
	var gr = new GlideRecord("wf_element_activity");
	if (gr.get(current.wf_element_definition))
		new WorkflowElementVersionUtils().deleteIt(gr);
}
