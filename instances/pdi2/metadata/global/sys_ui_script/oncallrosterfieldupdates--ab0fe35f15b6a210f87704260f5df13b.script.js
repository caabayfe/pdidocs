function rosterUpdates(rotationType, allDay, monthlyType) {
    if (rotationType == "daily") {
        g_form.setDisplay("rotation_all_day", false);
        g_form.setMandatory("rotation_start_time", false);
        g_form.setDisplay("rotation_start_time", false);
        hideMonthlyFields();
        hideWeeklyFields();
    } else if (rotationType == "weekly") {
        hideMonthlyFields();
        handleAllDay(allDay);
        g_form.setDisplay("rotation_all_day", true);
        g_form.setDisplay("dow_for_rotate", true);
    } else if (rotationType == "monthly") {
        hideWeeklyFields();
        handleAllDay(allDay);
        g_form.setMandatory("rotation_start_dom_type", true);
        g_form.setDisplay("rotation_start_dom_type", true);
        g_form.setDisplay("rotation_all_day", true);
        showRotationStartDom(monthlyType == "specific_day");
    }
}

function showRotationStartDom(show) {
    g_form.setMandatory("rotation_start_dom", show);
    g_form.setDisplay("rotation_start_dom", show);
}

function hideMonthlyFields() {
    g_form.setMandatory("rotation_start_dom_type", false);
    g_form.setDisplay("rotation_start_dom_type", false);
    g_form.setMandatory("rotation_start_dom", false);
    g_form.setDisplay("rotation_start_dom", false);
}

function hideWeeklyFields() {
    g_form.setDisplay("dow_for_rotate", false);
}

function handleAllDay(allDay) {
    var show = (allDay != "true");
    g_form.setMandatory("rotation_start_time", show);
    g_form.setDisplay("rotation_start_time", show);
}
