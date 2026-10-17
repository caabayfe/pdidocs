answer = (function() {
    var url = gs.action.getGlideURI();
    var groupsArray = url.get('sysparm_groups') ? url.get('sysparm_groups').split(',') : [];
    for (var i = 0; i < groupsArray.length; i++)
        if (!new OnCallSecurityNG().rotaAccess(groupsArray[i]))
            return false;
    return true;
})();
