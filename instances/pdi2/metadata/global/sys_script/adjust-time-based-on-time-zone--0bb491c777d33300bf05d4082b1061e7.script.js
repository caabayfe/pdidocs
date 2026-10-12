(function executeRule(current, previous /*null when async*/ ) {
    if (current == null || current.time_zone == '' || current.time_zone.equals("-- None --"))
        return;

    // Ignoring periodically jobs as it does not use run_time/entered_time
    if (current.run_type == "periodically")
        return;

    if (!current.entered_time.getValue()){
        gs.addErrorMessage(gs.getMessage("Record inserted or updated in table '{0}' with name '{1}' without Time (entered_time)", [current.getTableName(), current.name]));
    }

    var timeZoneAsString = current.time_zone;
    if (timeZoneAsString.equals("floating")) {
        current.run_time.setValue(current.entered_time.getValue());
    } else {
        var glideUtcTimeUtils = new GlideUtcTimeUtils();
        var newRunGlideTime = glideUtcTimeUtils.toGlideTime(current.entered_time, timeZoneAsString);
        if (!newRunGlideTime)
            current.setAbortAction(true);
        else
            current.run_time.setValue(newRunGlideTime.getValue());
    }
})(current, previous);
