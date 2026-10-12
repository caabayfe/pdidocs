(function executeRule(current, previous /*null when async*/ ) {

	var userId = gs.getUser().getID();
    var currentList = current.watch_list;
	var previousList = previous.watch_list;

	// User is explicitly removing him/herself from watch list
    if (previousList && previousList.indexOf(userId) > -1 && currentList.indexOf(userId) == -1)
		{
			gs.addInfoMessage(gs.getMessage("Current user has been removed from Watch list"));
		}
	else if (currentList && currentList.indexOf(userId) > -1)
    {
        // Current user already in the Watch list, not added
    } else
    {
        current.watch_list += ',' + userId;
        gs.addInfoMessage(gs.getMessage("Added {0} to the Watch list", userId));
    }

})(current, previous);
