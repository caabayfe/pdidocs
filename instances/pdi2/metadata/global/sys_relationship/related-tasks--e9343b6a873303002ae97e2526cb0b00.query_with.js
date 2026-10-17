(function refineQuery(current, parent) {

	current.addEncodedQuery("SUBQUERYsys_id,document_id,interaction_related_record^interaction=" + parent.sys_id + "^ENDSUBQUERY");

})(current, parent);
