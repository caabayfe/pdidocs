// if table is not populated, we should not allow creation
if (!current.table || !current.table.sys_id) {
	answer = false;
}
// if user has admin role as defined by table
else if (gs.hasRole(current.table.admin_roles)) {
	answer = true;
}
// if user is already responsible for this entity
else {
	var resp = new GlideRecord('pa_responsibility');
	resp.addQuery('entity', current.entity);
	resp.addQuery('user', gs.getUserID());
	resp.setLimit(1);
	resp.query();

	answer = resp.next();
}
