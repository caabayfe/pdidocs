(function refineQuery(current, parent) {
	current.addQuery("assigned_to", parent.opened_for);
	current.addNotNullQuery('assigned_to');
	//5136503cc611227c0183e96598c4f706 is the sysID for the guest user
	current.addQuery('assigned_to', '!=', '5136503cc611227c0183e96598c4f706');
	current.addQuery('install_status', '!=', 7);
})(current, parent);
