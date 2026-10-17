var gr = new GlideRecord("sys_update_preview_problem");
gr.get(current.prb_sys_id);

if (gr != null && gr.isValidRecord()) {
	var ppa = new GlidePreviewProblemAction(action, gr);
	ppa.ignoreProblem();
} 
