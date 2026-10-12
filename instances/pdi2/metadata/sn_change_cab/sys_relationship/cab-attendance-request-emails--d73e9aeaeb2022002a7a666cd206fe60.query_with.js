(function refineQuery(current, parent) {

	current.addQuery("mailbox","sent");
	current.addQuery("instance", parent.sys_id);

})(current, parent);
