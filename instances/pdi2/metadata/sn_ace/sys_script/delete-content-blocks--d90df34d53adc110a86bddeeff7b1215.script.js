(function executeRule(current, previous /*null when async*/ ) {

    var contentBlockGr = new GlideRecord('sn_ace_content_block');
    contentBlockGr.addQuery('document_id', current.sys_id);
    contentBlockGr.query();
    if (contentBlockGr.canDelete())
		contentBlockGr.deleteMultiple();

})(current, previous);
