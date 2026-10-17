answer = (function () {
    if ("groups and users" == current.viewable_by && gs.getUserID() != current.owner) {
        if (!gs.nil(current.group_list)) {
            var myGroups = gs.getUser().getMyGroups();
            var currentGroups = current.group_list.split(",");
            for (var i = 0; i < currentGroups.length; i++) {
                if (myGroups.contains(currentGroups[i]))
                    return true;
            }
        }

        if (!gs.nil(current.user_list)) {
            var myUserId = gs.getUserID();
            var currentUsers = current.user_list.split(",");
            for (var k = 0; k < currentUsers.length; k++) {
                if (currentUsers[k] == myUserId)
                    return true;
            }
        }
        return false;
    }
    return true;
})();
