function hr_getMyApprovals() {
    var userId = gs.getUserID();
	var utils = new sn_hr_sp.todoPageUtils();
    return utils.getApprovals(userId);
}
