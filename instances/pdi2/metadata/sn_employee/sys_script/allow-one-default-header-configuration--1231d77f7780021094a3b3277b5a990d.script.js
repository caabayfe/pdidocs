(function executeRule(current, previous /*null when async*/ ) {

    var configData = new ep_Utils().getDefaultHeaderConfigData();

    if (current.operation() == "insert" || (current.operation() == "update" && current.default != previous.default) ){
        if (Object.keys(configData).length && current.default) {
            gs.addErrorMessage(gs.getMessage("A default profile header configuration already exists. Please review your existing profile header configurations."));
            current.setAbortAction(true);
        }
    }


})(current, previous);
