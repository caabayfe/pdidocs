(function executeRule(current, previous /*null when async*/ ) {
     if (String(gs.action.getGlideURI()).startsWith(current.getTableName())) {
        var url = current.getTableName() + '.do?sys_id=' + current.getUniqueValue();
        gs.setRedirect(url);
    }
})(current, previous);
