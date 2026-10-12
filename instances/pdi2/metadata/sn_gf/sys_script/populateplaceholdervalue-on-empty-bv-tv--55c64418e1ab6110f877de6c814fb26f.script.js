(function executeRule(current, previous /*null when async*/ ) {

    var baseValue = current.getValue("base_value");
    var targetValue = current.getValue("target_value");

    if (global.JSUtil.notNil(current.getValue("check_in_frequency")) &&
        global.JSUtil.nil(targetValue)) { // TV empty, but CheckInFrequency is not empty

        if (global.JSUtil.nil(baseValue)) {
            current.setValue("base_value", 0);
            current.setValue("target_value", 0);
        } else {
            current.setValue("target_value", baseValue);
        }
    } else if (global.JSUtil.nil(baseValue) &&
        global.JSUtil.notNil(targetValue)) { // BV empty, but TV not empty

        current.setValue("base_value", 0);
    }

})(current, previous);
