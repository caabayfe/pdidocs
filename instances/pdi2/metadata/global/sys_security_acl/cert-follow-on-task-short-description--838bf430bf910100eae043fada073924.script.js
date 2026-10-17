if (gs.hasRole('certification_admin') || (gs.hasRole('certification') && (gs.getUserID() == current.assigned_to.sys_id))) {
	answer = true;
}
