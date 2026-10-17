(function executeRule(current, previous /*null when async*/ ) {
    var grChild = new GlideRecord('interaction_relationship_policy');
    grChild.addQuery('document_table', current.document_table);
	grChild.addQuery('sys_domain', current.sys_domain);
    grChild.addQuery('sys_id', '!=', current.getUniqueValue());
    grChild.query();
    if (grChild.next()) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("{0} document_table record already exists", [GlideStringUtil.escapeHTML(current.document_table)]));
    }
})(current, previous);
