if (gs.getProperty('glide.knowman.submission.workflow') == 'true')
    submitCandidate();
else
    submitDirect();

function submitDirect() {
    var kb = new GlideRecord("kb_knowledge");
    kb.source = current.sys_id;
    kb.short_description = current.short_description;
    kb.sys_domain = current.sys_domain;
    kb.text = current.work_notes.getHTMLValue();
    kb.workflow_state = 'draft';
	kb.kb_knowledge_base = gs.getProperty("glide.knowman.task_kb", "dfc19531bf2021003f07e2c1ac0739ab");
    var kb_id = kb.insert();
	if(kb_id)
		gs.addInfoMessage(gs.getMessage('Knowledge Article created: {0}', kb.number));
}

function submitCandidate() {
    var gr = new GlideRecord('kb_submission');
    gr.parent = current.sys_id;
    gr.short_description = current.short_description;
    gr.sys_domain = current.sys_domain;
    gr.text = current.work_notes.getHTMLValue();
    var gr_id = gr.insert();
	if(gr_id)
		gs.addInfoMessage(gs.getMessage('Knowledge Submission created: {0}', gr.number));
}
