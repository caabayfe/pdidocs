(function executeRule(current, previous /*null when async*/ ) {

    var processDef = current.getValue("process_def");
    if (current.operation() == "delete" || current.getValue("field") != previous.getValue("field")) {
        new ProminProcessConfigUtil().deleteControlFlowValueMapping(processDef);
    }

})(current, previous);
