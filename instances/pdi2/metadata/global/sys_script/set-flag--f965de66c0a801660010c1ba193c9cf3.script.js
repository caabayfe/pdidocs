setFlag();

function setFlag() {
    var feedback = new GlideRecord("kb_feedback");
    feedback.addQuery("article",current.sys_id);
    feedback.addQuery("flagged","true");
    feedback.query();
    current.flagged = feedback.hasNext();
}
