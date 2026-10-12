if (current.isNewRecord()) {
	answer = true;
} else {
	answer = current.sys_created_by == gs.getUser().getName();
}
	
