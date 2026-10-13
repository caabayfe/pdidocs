function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    g_form.getReference("channel_type", showMessageFields);
}

function showMessageFields(commType) {
    var type = commType.getValue("type");
    if (type == "mobile_notification" || type == "slack") {

        var fieldsToHide = ["user_escalation_message", "device_escalation_message", "catch_all_escalation_message", "user_escalation_title", "device_escalation_title", "catch_all_escalation_title", "accept_keyword", "reject_keyword", "user_accept_instruction", "user_reject_instruction", "catch_all_accept_instruction", "catch_all_reject_instruction"];
        var sectionsToHide = ["user", "device", "catch_all"];

        setMandatory(fieldsToHide, false);
        setReadOnly(fieldsToHide, false);
        setDisplay(fieldsToHide, sectionsToHide, false);

        hideMessageAnnotations();

    } else if (["sms", "email", "teams", "voice"].indexOf(type) != -1) {

        var fieldsToHide = [];
        var sectionsToShow = ["user", "device", "catch_all"];
        var fieldsToShow = ["accept_keyword", "reject_keyword", "user_accept_instruction", "user_reject_instruction", "catch_all_accept_instruction", "catch_all_reject_instruction"];
        var titleFields = ["user_escalation_title", "device_escalation_title", "catch_all_escalation_title"];
        var messageFields = ["user_escalation_message", "device_escalation_message", "catch_all_escalation_message"];
        var readOnlyFields = [];

        if (type == "sms") {
            readOnlyFields = ["accept_keyword", "reject_keyword"];
            g_form.setValue("accept_keyword", "ACC");
            g_form.setValue("reject_keyword", "REJ");
        }

        var showTitleFields = type != "sms" && type != "voice";
        var showMessageFields = type != "teams";

        if (showTitleFields) fieldsToShow = fieldsToShow.concat(titleFields);
        else fieldsToHide = fieldsToHide.concat(titleFields);

        if (showMessageFields) fieldsToShow = fieldsToShow.concat(messageFields);
        else fieldsToHide = fieldsToHide.concat(messageFields);

        setMandatory(fieldsToHide, false);
        setReadOnly(fieldsToHide, false);
        setDisplay(fieldsToHide, [], false);

        setDisplay(fieldsToShow, sectionsToShow, true);
        setMandatory(fieldsToShow, true);
        setReadOnly(fieldsToShow, false);
        setReadOnly(readOnlyFields, true);

        showMessageAnnotations();
    }
}

function setDisplay(fields, sections, display) {
    if (!fields && !sections) return;
    for (var i = 0; i < fields.length; i++) g_form.setDisplay(fields[i], display);
    for (var i = 0; i < sections.length; i++) g_form.setSectionDisplay(sections[i], display);
}

function setMandatory(fields, isMandatory) {
    if (!fields) return;
    for (var i = 0; i < fields.length; i++) g_form.setMandatory(fields[i], isMandatory);
}

function setReadOnly(fields, isReadOnly) {
    if (!fields) return;
    for (var i = 0; i < fields.length; i++) g_form.setReadOnly(fields[i], isReadOnly);
}

function showMessageAnnotations() {
    setMessageAnnotationsDisplay('');
}

function hideMessageAnnotations() {
    setMessageAnnotationsDisplay('none');
}

function setMessageAnnotationsDisplay(display) {
    var responseKeywordsEle = window.document.getElementById('response_keywords');

    if (responseKeywordsEle) {
        var tdElement = responseKeywordsEle.closest('td');
        if (tdElement) {
            tdElement.style.display = display;
        }
    }

    var messagesEle = window.document.getElementById('messages_section');

    if (messagesEle) {
        var tdElement1 = messagesEle.closest('td');
        if (tdElement1) {
            tdElement1.style.display = display;
        }
    }
}
