(function executeRule(current, previous /*null when async*/ ) {
    var url = current.getTableName() + '.do?sys_id=' + current.sys_id;
    gs.setRedirect(url);
})(current, previous);
