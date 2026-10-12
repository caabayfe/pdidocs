(function executeRule(current, previous /*null when async*/ ) {
    var link = "";
    if (current.type == 'PROJECT') {
        link = "<a href=/now/experience/promin/rule-based-finding-setup/PROJECT/" + current.project + "/params/finding-def-id/" + current.getUniqueValue() + ">";
    } else {
        link = "<a href=/now/experience/promin/rule-based-finding-setup/PROCESS/" + current.process_def + "/params/finding-def-id/" + current.getUniqueValue() + ">";
    }

    gs.addInfoMessage(gs.getMessage("Use finding builder {0}here</a> to create or edit definitions and leverage additional features.", link));

})(current, previous);
