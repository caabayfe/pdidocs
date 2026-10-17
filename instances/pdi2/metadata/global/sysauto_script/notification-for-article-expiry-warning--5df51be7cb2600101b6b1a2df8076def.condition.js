answer = false;
if (gs.getProperty("glide.knowman.enable_article_expiry_notification", "false")==="true") {
    var gr = new GlideRecord('kb_knowledge');
    gr.addEncodedQuery('workflow_stateINpublished^kb_knowledge_base.active=true^valid_toONNext month@javascript:gs.beginningOfNextMonth()@javascript:gs.endOfNextMonth()');
    gr.query();
    answer = gr.next();
}
