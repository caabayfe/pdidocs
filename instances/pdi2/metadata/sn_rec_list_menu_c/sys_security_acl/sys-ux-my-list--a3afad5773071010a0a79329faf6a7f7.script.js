
    answer = (current.sys_created_by.toLowerCase() == gs.getUserName().toLowerCase()) || userIsInSharedUsers() || userIsMemberOfGroups();

    function userIsMemberOfGroups() {
    var myGroups = gs.getUser().getMyGroups();
    var currentGroups = current.shared_groups.split(',');
    for (var i = 0; i < currentGroups.length; i++) {
        if (myGroups.indexOf(currentGroups[i]) !== -1)
            return true;
    }
    return false;
    }

    function userIsInSharedUsers() {
    var sharedUsers = current.shared_users;
    if (sharedUsers && sharedUsers.indexOf(gs.getUserID()) !== -1)
        return true;
    return false;
    }
    
