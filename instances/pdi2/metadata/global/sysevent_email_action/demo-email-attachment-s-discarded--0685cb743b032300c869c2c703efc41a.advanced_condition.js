(function() {
	var userId = current.user_id;

	if (!userId)
		return false;

	var fromUser = GlideUser.getUserByID(userId);

	if (!fromuser.exists() || fromUser.isLockedOut() || !fromUser.isActive())
		return false;

	return true;
})();
