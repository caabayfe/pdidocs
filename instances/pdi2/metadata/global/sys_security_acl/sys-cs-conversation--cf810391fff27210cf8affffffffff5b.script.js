(function () {
    if (gs.hasRole('maint')) return true;

    // Only allow writes on OPEN conversations that are in progress
	if (current.state != 'open' && current.state != 'chatInProgress') return false;

    if (!current.consumer) return false;

    var c = new GlideRecord('sys_cs_consumer');
    if (!c.get(current.consumer.toString())) return false;

    var convUserId = c.user_id.toString();
    var userId = gs.getUserID().toString();

    if (convUserId === userId) {
      return true;
    }

    var isGuest = !gs.getSession().isLoggedIn();
    if (isGuest) {
		return !c.guest_user.nil();
    }
    return false;
})();
