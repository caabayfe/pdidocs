var showErrorMsg = function(errorMsg, sourceFieldName) {
    g_form.showErrorBox(sourceFieldName, errorMsg);
};

function validateField(startDateField, endDateField) {

    g_form.hideFieldMsg(startDateField, true);
    g_form.hideFieldMsg(endDateField, true);

    var isStartDateValid = isValidDate(startDateField);
    if (!isStartDateValid)
        showErrorMsg(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(startDateField)), startDateField);

    var isEndDateValid = isValidDate(endDateField);
    if (!isEndDateValid)
        showErrorMsg(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(endDateField)), endDateField);

    if (!isStartDateValid || !isEndDateValid)
        return;

    if (validateStartDateBeforeEndDate(startDateField, endDateField, showErrorMsg) && (typeof validateMaxDateDuration !== "undefined"))
        validateMaxDateDuration(startDateField, endDateField, showErrorMsg);
}

function isValidDate(fieldName) {
    var dateValue = g_form.getValue(fieldName);
    // The field is empty, not an invalid date
    if (dateValue === '')
        return true;
    var dateValueMs = getDateInMillis(fieldName);

    // 0 from "getDateFormat" means an invalid date string was passed to itx
    return (dateValue !== "" && dateValueMs > 0);
}

function validateStartDateBeforeEndDate(startDateField, endDateField, processErrorMsg) {
    var startDate = g_form.getValue(startDateField);
    var endDate = g_form.getValue(endDateField);
    var startDateMs = getDateInMillis(startDateField);
    var endDateMs = getDateInMillis(endDateField);

    processErrorMsg = typeof processErrorMsg === 'function' ? processErrorMsg : showErrorMsg;

    if (startDate === "" || endDate === "")
        return true;

    if (startDateMs < endDateMs)
        return true;

    if (startDateMs > endDateMs) {
        processErrorMsg(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf(endDateField), g_form.getLabelOf(startDateField)), endDateField);
        return false;
    }

    return true;
}

function areDatesWithinRange(startRangeDate, endRangeDate, dates) {
    var format = g_user_date_time_format;
    var startRangeDateMs = getDateFromFormat(startRangeDate, format);
    var endRangeDateMs = getDateFromFormat(endRangeDate, format);

    if (!Array.isArray(dates))
        dates = [dates];

    for (var i = 0; i < dates.length; i++) {
        var dateMs = getDateFromFormat(dates[i], format);
        if (dateMs == 0)
            continue;
        if (dateMs < startRangeDateMs || (endRangeDateMs > 0 && dateMs > endRangeDateMs))
            return false;
    }
    return true;
}

function validateMaxDateDuration(startDateField, endDateField, processErrorMsg) {
    var startDate = g_form.getValue(startDateField);
    var endDate = g_form.getValue(endDateField);

    var format = g_user_date_time_format;

    if (startDate === "" || endDate === "")
        return true;

    // get date strings into a number of milliseconds since 1970-01-01
    var startDateMs = getDateFromFormat(startDate, format);
    var endDateMs = getDateFromFormat(endDate, format);

    // The same validation is done server-side for both Planned and Actual start/end dates
    var FIFTY_YEARS_MILLIS = 1576800000000; // 1000 * 60 * 60 * 24 * 365 * 50

    processErrorMsg = typeof processErrorMsg === 'function' ? processErrorMsg : showErrorMsg;

    if (endDateMs - startDateMs > FIFTY_YEARS_MILLIS) {
        processErrorMsg(new GwtMessage().getMessage("{0} cannot be more than 50 years after {1}", g_form.getLabelOf(endDateField), g_form.getLabelOf(startDateField)), endDateField);
        return false;
    }

    return true;
}

function getDateInMillis(dateFieldId) {
    var userDatetimeFormat = g_user_date_time_format;
    // when the form is live loading and the date field is readonly (ACL/Dictionary, not Client Script/UI Policy), the date is in the wrong format (PRB717143) and may not in the user's timezone
    var systemDateTimeFormat = "yyyy-MM-dd HH:mm:ss"; 
    var timezoneOffset = g_tz_offset;

    // These are the use cases we're covering here:
    // 1 - The date field is not read-only: there's only one value to worry about, the one we see in the date field
    // 2 - The date field is read-only, set by a Client Script/UI Policy, which means there is still only one field to care about
    // 3 - The date field is read-only, set server-side by ACL/Dictionary (there are now two fields)
    //   3.1 - The field has been live updated (Record Watcher)
    //   3.2 - The field has not been changed
    var fieldValue = g_form.getValue(dateFieldId);
    var fieldControl = g_form.getControl(dateFieldId);
    var fieldReadOnly = fieldControl ? gel("sys_readonly." + fieldControl.id) : null;

    if (fieldReadOnly && fieldReadOnly.value !== fieldValue) {
        if (!isDate(fieldValue, systemDateTimeFormat))
            return 0;

        var gwtDate = new GwtDate(fieldValue);
        gwtDate.addSeconds(timezoneOffset / 1000);
        return getDateFromFormat(gwtDate.toString(), systemDateTimeFormat); // Use cases 3.1 and 3.2
    } else
        return getDateFromFormat(fieldValue, userDatetimeFormat); // Use cases 1 and 2
}
