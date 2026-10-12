(function executeRule(current, previous /*null when async*/ ) {
    var userId = gs.getUserID();
    if (!current.owner)
        current.owner = userId;
})(current, previous);
