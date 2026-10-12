function onChange(control, oldValue, newValue, isLoading, callback) {
    if (isLoading || newValue == '') {
        return;
    }

    if ((oldValue == "maximize" && newValue == "minimize") ||
        (oldValue == "minimize" && newValue == "maximize")) {
        g_scratchpad.recentQuantitativeType = newValue;
    }

}
