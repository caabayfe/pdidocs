(function executeRule(current, previous /*null when async*/ ) {
    var MAX_KEY_LENGTH = 255; // sys_ui_message.key's max_length
    var cancelTransaction = false;

    var lines = new SearchHealthMetricDefinitionMessageSync().splitMessageLines(current.getValue('messages'));
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > MAX_KEY_LENGTH) {
            gs.addErrorMessage(gs.getMessage('Messages line is {0} characters, too long to sync as a translation key (limit {1}): {2}',
                [lines[i].length.toString(), MAX_KEY_LENGTH.toString(), lines[i]]));
            cancelTransaction = true;
        }
    }

    if (cancelTransaction)
        current.setAbortAction(true);
})(current, previous);
