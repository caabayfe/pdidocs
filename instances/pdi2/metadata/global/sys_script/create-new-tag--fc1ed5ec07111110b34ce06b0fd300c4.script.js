(function executeRule(current, previous /*null when async*/ ) {
    if (!current) return;

    var evtMgmtAlertTagsUtil = new global.EvtMgmtAlertTagsUtil();

    var mappingFields = current.mapping.split(',');
    for (var i = 0; i < mappingFields.length; i++) {
        if (!gs.nil(mappingFields[i].trim())) {
            evtMgmtAlertTagsUtil.addNewAlertTagIfDoesntExistInTable(mappingFields[i].trim());
        }

    }
})(current, previous);
