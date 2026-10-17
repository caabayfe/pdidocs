(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
    current.addQuery('document_id',parent.sys_id);
    current.addQuery('source_table','sn_publications_publication');	
})(current, parent);
