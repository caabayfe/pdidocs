(function refineQuery(current, parent) {
    current.addQuery('document_record', parent.sys_id);
    current.addQuery('document_table', 'sys_cs_provider');
})(current, parent);
