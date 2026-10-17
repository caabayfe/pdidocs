(function executeRule(current, previous /*null when async*/ ) {
    // Same validation performed in system_properties.do processor - this covers a different path
    var invalidChars = [];
    var format = current.getValue("value");
    if (current.getValue("name") == 'glide.sys.date_format') {
        if (format.isNil()) {
            gs.addErrorMessage(gs.getMessage("Date format cannot be empty."));
            current.setAbortAction(true);
            return;
        }

        if (format.indexOf("m") > -1) {
            invalidChars.push("m");
        }
        if (format.indexOf("h") > -1) {
            invalidChars.push("h");
        }
        if (format.indexOf("H") > -1) {
            invalidChars.push("H");
        }
        if (format.indexOf("s") > -1) {
            invalidChars.push("s");
        }
        if (format.indexOf("a") > -1) {
            invalidChars.push("a");
        }
        if (invalidChars.length) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("Invalid date format '{0}': contains time format characters '{1}'", [format, invalidChars.toString()]));
        }
    } else if (current.getValue('name') == 'glide.sys.time_format') {
        if (format.isNil()) {
            gs.addErrorMessage(gs.getMessage("Time format cannot be empty."));
            current.setAbortAction(true);
            return;
        }

        if (format.indexOf("M") > -1) {
            invalidChars.push("M");
        }
        if (format.indexOf("y") > -1) {
            invalidChars.push("y");
        }
        if (format.indexOf("d") > -1) {
            invalidChars.push("d");
        }

        if (invalidChars.length) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("Invalid time format '{0}': contains date format characters '{1}'", [format, invalidChars.toString()]));
        }
    }
})(current, previous);
