(function executeRule(current, previous /*null when async*/ ) {

    if (isOOBConfig(previous)) {
        if (current.getElement('detect_sub_flow').changes()) {
            gs.addErrorMessage(gs.getMessage("For a translator configuration that is available by default, you cannot modify the Detect Subflow field."));
            current.setAbortAction(true);
        } else if (current.getElement('translate_sub_flow').changes()) {
            gs.addErrorMessage(gs.getMessage("For a translator configuration that is available by default, you cannot modify the Translate Subflow field."));
            current.setAbortAction(true);
        } else if (current.getElement('name').changes()) {
            gs.addErrorMessage(gs.getMessage("For a translator configuration that is available by default, you cannot modify the Name field."));
            current.setAbortAction(true);
        } else if (current.getElement('version').changes()) {
            gs.addErrorMessage(gs.getMessage("For a translator configuration that is available by default, you cannot modify the Version field."));
            current.setAbortAction(true);
        } else if (current.getElement('language_code_mappings').changes()) {
            gs.addErrorMessage(gs.getMessage("For a translator configuration that is available by default, you cannot modify the Language Code Mappings field."));
            current.setAbortAction(true);
        }
    }

    function isOOBConfig(previous) {

        //Microsoft translator sys_ids
        var MICROSOFT_DETECT_SYS_ID_V4 = 'a8985b387fd01210b45ae248ec8665b6';
        var MICROSOFT_TRANSLATE_SYS_ID_V4 = '219b23cd5342101026b0ddeeff7b126a';

        //ServiceNow Langauge Detection sysids
        var LDS_DETECT_SYS_ID_V3 = '66a95875c723101020dab6c427c26052';

        //Check for Microsoft OOB configuration record
        if (previous.getValue('detect_sub_flow') === MICROSOFT_DETECT_SYS_ID_V4 &&
            previous.getValue('translate_sub_flow') === MICROSOFT_TRANSLATE_SYS_ID_V4 &&
            previous.getValue('name') === 'Microsoft' &&
            previous.getValue('version') === 'v4') {
            return true;
        }
        //Check for LDS OOB configuration record
        else if (previous.getValue('detect_sub_flow') === LDS_DETECT_SYS_ID_V3 &&
            !previous.getValue('translate_sub_flow') &&
            previous.getValue('name') === 'ServiceNow' &&
            previous.getValue('version') === 'v4') {
            return true;
        }
        return false;
    }

})(current, previous);
