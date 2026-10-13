function onSubmit() {

    // check if anything has changed before translating or showing the results section initially
    if (g_form.getValue('inputs_changed') === 'true') {

        g_form.setValue('test_executed', true); // Displays the results section after submitting
        var newOrExisting = g_form.getValue('do_you_want_to_test_an_existing_or_new_exclusion_rule');
        var exclusionTerm = '';
        var ruleType = '';
        var currentExclusionRule = '';

        if (newOrExisting === 'new_exclusion_rule') {
            ruleType = g_form.getValue('rule_type');
            if (ruleType === 'pattern_match') {
                var regexStr = g_form.getValue('exclusion_pattern');
                // will check if regex validation needs to take place for a new exclusion rule with pattern match
                if (!isRegexValid(regexStr)) {
                    g_form.addErrorMessage(getMessage('Please enter a different exclusion pattern and try again, the regex provided is invalid.'));
                    g_form.showFieldMsg('exclusion_pattern', getMessage('Invalid regex provided'), 'error');
                    return false;
                }
                exclusionTerm = g_form.getValue('exclusion_pattern');
            } else {
                exclusionTerm = g_form.getValue('exclusion_term');
            }
        } else {
            currentExclusionRule = g_form.getValue('which_exclusion_pattern_would_you_like_to_test');
        }

        var inputText = g_form.getValue('input');
        var languageSelected = g_form.getValue('target_language');
        g_form.setValue('target_language_selected', languageSelected);
        var provider = g_form.getValue('translation_provider');

        // translate and bold the output 
        var translatedTextGA2 = new GlideAjax('sn_dt.TestExclusionRuleUtilsAjax');
        translatedTextGA2.addParam('sysparm_name', 'translateTextAndBold');
        translatedTextGA2.addParam('sysparm_inputText', inputText);
        translatedTextGA2.addParam('sysparm_exclusionRuleId', currentExclusionRule);
        translatedTextGA2.addParam('sysparm_ruleType', ruleType);
        translatedTextGA2.addParam('sysparm_exclusionTerm', exclusionTerm);
        translatedTextGA2.addParam('sysparm_languageSelected', languageSelected);
        translatedTextGA2.addParam('sysparm_translationProvider', provider);

        // update the output and language detected
        translatedTextGA2.getXMLAnswer(_updateTranslatedText);

        // bold the input
        var boldedInputGA = new GlideAjax('sn_dt.TestExclusionRuleUtilsAjax');
        boldedInputGA.addParam('sysparm_name', 'boldInputText');
        boldedInputGA.addParam('sysparm_inputText', inputText);
        boldedInputGA.addParam('sysparm_translationProvider', provider);
        boldedInputGA.addParam('sysparm_exclusionRuleId', currentExclusionRule);
        boldedInputGA.addParam('sysparm_ruleType', ruleType);
        boldedInputGA.addParam('sysparm_exclusionTerm', exclusionTerm);

        // update the input in results section with bolded text
        boldedInputGA.getXMLAnswer(_updateInputText);

        // resets variables for next submit
        g_form.setValue('inputs_changed', false);
        exclusionTerm = '';
        ruleType = '';
        currentExclusionRule = '';
    }

    // Abort the submission
    g_form.submitted = false;
    return false;
}

function isRegexValid(pattern) {
    try {
        new RegExp(pattern);
        return true;
    } catch (e) {
        return false;
    }
}

function _updateTranslatedText(response) {
    var answer = JSON.parse(response);
    _expandHTMLElement('output');
    g_form.setValue('output', answer.boldedTranslatedText);
    g_form.setValue('language_detected', answer.detectedLanguageName);
}

function _expandHTMLElement(nameOfVariable) {
    var defaultHeight = '170px';
    var variableHTML = g_form.getControl(nameOfVariable);
    var parentHTML = g_form.getControl('variable_' + variableHTML.id);
    var childHTMLToExpand = parentHTML.children[1].children[2];
    childHTMLToExpand.setAttribute('style', 'height: '+ defaultHeight);
}

function _updateInputText(response) {
    _expandHTMLElement('input_text');
    g_form.setValue('input_text', response);
}
