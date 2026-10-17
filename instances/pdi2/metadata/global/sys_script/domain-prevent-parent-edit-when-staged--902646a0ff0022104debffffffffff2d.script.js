(function executeRule(current, previous /*null when async*/ ) {
    if (current.parent != previous.parent) {
        current.parent = previous.parent;
        gs.addInfoMessage(gs.getMessage('The Parent field cannot be updated because the domain is currently under "Staging for Deletion"'));
        return false;
    }
})(current, previous);
