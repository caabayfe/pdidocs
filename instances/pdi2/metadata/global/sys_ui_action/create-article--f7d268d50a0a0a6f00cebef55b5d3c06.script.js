generateKB();

function generateKB() {
    if (current.changes())
      current.update();
    var gr = new GlideRecord('kb_knowledge');
    gr.initialize();
    gr.newRecord();
    gr.text = current.text;
    gr.source = current.sys_id;
    gr.sys_domain = current.sys_domain;
    gr.short_description = current.short_description;
    gr.valid_to = current.valid_to;
    gr.direct = current.direct;
    gr.display_attachments = current.display_attachments;
	gr.kb_knowledge_base = gs.getProperty("glide.knowman.task_kb", "dfc19531bf2021003f07e2c1ac0739ab");
    if (current.hasAttachments()) {
        var ids = GlideSysAttachment.copy('kb_submission', current.sys_id, 'kb_knowledge', gr.sys_id);
        ids = ids.toArray();
        for (var i = 0; i < ids.length; i++) {
            var oldandnew = ids[i].split(',');
            gr.text = gr.text.toString().replaceAll(oldandnew[0],oldandnew[1]);
        }
    }
    var newID = gr.insert();
    gs.addInfoMessage(gs.getMessage("Article {0} created", gr.number));
    action.setRedirectURL(gr);
    action.setReturnURL(current);
}
