(function executeRule(current, previous /*null when async*/ ) {

    validateMIDLogFileHandlerProperties();

    function validateMIDLogFileHandlerProperties() {

        if (!isMIDLogFileHandlerProperty(current.name + ''))
            return;


        if (isDefaultMIDLogFileHandlerProperty(current.sys_id + '')) {
            if (current.operation() == 'delete') {
                gs.addErrorMessage(gs.getMessage("MID Server property '{0}' cannot be deleted. For details, see KB1637658.", String(current.name)));
                current.setAbortAction(true);
                return;
            }

            if (current.operation() == 'update') {

                if (String(previous.name) !== String(current.name)) {
                    gs.addErrorMessage(gs.getMessage("The name of MID Server property '{0}' cannot be changed. For details, see KB1637658.", previous.name));
                    current.setAbortAction(true);
                    return;
                }

                if (String(previous.ecc_agent) !== String(current.ecc_agent)) {
                    gs.addErrorMessage(gs.getMessage("The MID Server field of MID Server property '{0}' cannot be changed. Create a new MID Server property record with the same property name to override the default setting for a specific MID Server.", previous.name));
                    current.setAbortAction(true);
                    return;
                }
            }
        }
        gs.addInfoMessage(gs.getMessage("Use the Restart MID UI action to implement the changes. For details, see KB1637658."));
    }

    function isDefaultMIDLogFileHandlerProperty(sys_id) {
        var glideProperties = ["0ddb3e02a391421018141b66471e61d3",
            "594bf202a391421018141b66471e61ee",
            "1041fcc6a311421018141b66471e6101",
            "6dda3ecea351421018141b66471e61b1"
        ];
        for (var i = 0; i < glideProperties.length; i++) {
            if (glideProperties[i] === sys_id) {
                return true;
            }
        }
        return false;
    }

    function isMIDLogFileHandlerProperty(name) {
        var logGlidePropertyPrefix = "com.service_now.mid.logging.MIDLogFileHandler";
        if (name.toString().indexOf(logGlidePropertyPrefix) > -1)
            return true;
        return false;
    }
})(current, previous);
