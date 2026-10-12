(function executeRule(current, previous /*null when async*/ ) {

    var message = "";
    var link = "";
    var processConfigListLink = "<a href='/now/experience/promin/process-configuration' target='_blank'>here</a>";
    if (current.content_pack) {
        var processDefGr = new GlideRecord("promin_process_def");
        processDefGr.addQuery("table", current.table);
        processDefGr.addQuery("content_pack", false);
        processDefGr.query();
        if (processDefGr.next()) {
            link = "<a href='/now/experience/promin/process-configuration-details/" + processDefGr.getUniqueValue() + "/process-details' target='_blank'>here</a>";
            message = gs.getMessage("This is a read-only process configuration template for {0} table. Try the process configuration builder to leverage additional features and to copy selected sections to your existing {1} process configuration {2}", [current.table, current.table, link]);
        } else {
            message = gs.getMessage("This is a read-only process configuration template for {0} table. Please create a copy to use it for your projects. Try the process configuration builder {1} to leverage additional features.", [current.table, processConfigListLink]);
        }
    } else {
        if (current.isNewRecord()) {
            link = processConfigListLink;
        } else {
            link = "<a href='/now/experience/promin/process-configuration-details/" + current.getUniqueValue() + "/process-details' target='_blank'>here</a>";
        }
        message = gs.getMessage("Try using the process configuration builder {0} to leverage additional features and get guidance on configurations.", link);
    }
    gs.addInfoMessage(message);

})(current, previous);
