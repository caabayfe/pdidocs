function onSubmit() {
    g_form.hideFieldMsg("pattern_exclusion_term");

    var regexStr = g_form.getValue("pattern_exclusion_term");
    if (!isRegexValid(regexStr)) {
        g_form.showFieldMsg("pattern_exclusion_term", getMessage("Invalid regex provided"), "error");
        return false;
    }
    return true;
}

function isRegexValid(pattern) {
    try {
        new RegExp(pattern);
        return true;
    } catch (e) {
        return false;
    }
}
