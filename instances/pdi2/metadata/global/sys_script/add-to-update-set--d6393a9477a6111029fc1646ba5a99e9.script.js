(function executeRule(current, previous /*null when async*/ ) {
    var um = new GlideUpdateManager2();
    um.saveRecord(current);
})(current, previous);
