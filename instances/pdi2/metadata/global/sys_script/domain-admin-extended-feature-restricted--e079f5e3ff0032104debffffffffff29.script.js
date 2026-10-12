(function executeRule(current, previous /*null when async*/ ) {
    //some feature like preview overrides, compare etc. will not be available for domain admin
    gs.addInfoMessage(gs.getMessage('Advanced features require read access to all process tables. A user with the Admin role is recommended.'));
})(current, previous);
