function redirectToNewRule() {
    //scroll to top in case there are errors
    window.scroll(0, 0);
    g_form.hideErrorBox("exclusion_pattern");

    var ruleType = g_form.getValue("rule_type");
    var isPatternMatch = ruleType === "pattern_match";
    var exclusionPattern = g_form.getValue("exclusion_pattern");
    var exclusionTerm = g_form.getValue("exclusion_term");

    if (isPatternMatch && !isRegexValid(exclusionPattern)) {
        g_form.showErrorBox("exclusion_pattern", getMessage("Invalid regex expression provided."));
        return;
    }

    if (isPatternMatch && !exclusionPattern) {
        g_form.showErrorBox("exclusion_pattern", getMessage("Please add an exclusion pattern."));
        return;
    }

    if (!isPatternMatch && !exclusionTerm) {
        g_form.showErrorBox("exclusion_term", getMessage("Please add an exclusion term."));
        return;
    }

    // call ajax to insert rule
    var insertRuleAjax = new GlideAjax('sn_dt.TestExclusionRuleUtilsAjax');
    insertRuleAjax.addParam('sysparm_name', 'insertExclusionRule');
    insertRuleAjax.addParam('sysparm_rule_type', ruleType);
    insertRuleAjax.addParam('sysparm_exclusion_term', isPatternMatch ? exclusionPattern : exclusionTerm);
    insertRuleAjax.getXMLAnswer(handleResponseInsert);
}

// handle response for insert rule
function handleResponseInsert(response) {
    if (response !== 'duplicate') {
        // need to tell g_form that the form was submitted so the browser doesn 't alert of dirty form
        g_form.submitted = true;
        redirectOnMainFrame("/sn_dt_exclusion_rule.do?sys_id=" + response);
    }
}

// Check if the pattern is a valid regex by trying to parse it
function isRegexValid(pattern) {
    try {
        new RegExp(pattern);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Function copied from another ui page to redirect on the main frame
 * 
 * This function finds main frame and redirect on it with provided URL.
 * It was tested on chrome, FF6, IE11, Edge17.
 */
function redirectOnMainFrame(url) {
    var frames = window.top.document.getElementsByTagName("iframe");

    //MS Edge browser doesn't work with window.frames, which is the reason for this loop.
    for (var i = 0; i < frames.length; i++) {
        if (frames[i].name === "gsft_main") {
            frames[i].setAttribute("src", url);
            return;
        }
    }

    //gsft_main not found, assuming standalone window and redirecting top frame
    window.top.location.href = url;
}
