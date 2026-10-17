(function executeRule(current, previous /*null when async*/ ) {
    var link = "";
    if (gs.nil(current.process_def)) {
        link = "<a href=/now/experience/promin/configure-finding-pattern/" + current.project + '/params/finding-id/' + current.getUniqueValue() + ">";
    } else {
        link = "<a href=/now/experience/promin/configure-finding-pattern/" + current.process_def + '/params/finding-id/' + current.getUniqueValue() + ">";
    }
    gs.addInfoMessage(gs.getMessage("Use finding builder {0}here</a> to create or edit definitions and leverage additional features.", link));

})(current, previous);
