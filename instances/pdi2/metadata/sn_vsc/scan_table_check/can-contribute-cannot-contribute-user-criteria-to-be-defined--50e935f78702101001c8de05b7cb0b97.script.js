(function(finding, current) {

    var kb_id = current.sys_id.toString();
    var ccGR = new GlideRecord('kb_uc_can_contribute_mtom');
    ccGR.addQuery('kb_knowledge_base', kb_id);
    ccGR.query();
    if (!ccGR.hasNext()) {
        var ncGR = new GlideRecord('kb_uc_cannot_contribute_mtom');
        ncGR.addQuery('kb_knowledge_base', kb_id);
        ncGR.query();
        if (!ncGR.hasNext()) {
            finding.increment();
        }
    }

})(finding, current);
