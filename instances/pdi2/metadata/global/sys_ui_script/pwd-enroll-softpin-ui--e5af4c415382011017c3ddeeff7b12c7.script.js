/**
 * Validate the form before submit.
 */
var lastSubmittedSoftPin = '';
function softpin_on_submit(formId) {
    var currForm = document.getElementById(formId);
    var verificationId = currForm.elements['verification_id'].value;
    var providedSoftPIN = currForm.elements['softpin_input'].value;
    var mandatoryVerification = currForm.elements['mandatory'].value;
    var pinChanged = currForm.elements['pin_changed'].value;
    if (currForm == null)
        return false;

    if ((mandatoryVerification != 'true' && providedSoftPIN == '')
        || (pinChanged != 'true' && providedSoftPIN != ''))
        return true;

    var providedPinElement = getSoftPIN(currForm);
    var trimmedPIN = providedPinElement.value.trim();
    var charRepetitionThreshold = currForm.elements['repetition_threshold_for_soft_pin'].value;
    charRepetitionThreshold = parseInt(charRepetitionThreshold);
    var charSequenceThreshold = currForm.elements['sequence_threshold_for_soft_pin'].value;
    charSequenceThreshold = parseInt(charSequenceThreshold);
    var SOFT_PIN_LENGTH = currForm.elements['pin_length_for_soft_pin'].value;
    SOFT_PIN_LENGTH = parseInt(SOFT_PIN_LENGTH);
    var errorMessage;

    var digitPattern = new RegExp("^\\d{" + SOFT_PIN_LENGTH + "}$");
    if (!digitPattern.test(providedSoftPIN)) {
        errorMessage = new GwtMessage().getMessage('Soft PIN should be {0} digits', SOFT_PIN_LENGTH);
        handleInvalidForm(currForm, errorMessage);
        return false;
    }

    //Validating softpin for repeated continuous digits
    var repetitionsPattern = "(\\d+)";
    for (var i = 0; i < charRepetitionThreshold; i++)
        repetitionsPattern += "\\1";
    var repetitionsPatternRegX = new RegExp(repetitionsPattern);
    if (repetitionsPatternRegX.test(providedSoftPIN)) {
        errorMessage = new GwtMessage().getMessage("Soft PIN cannot have more than {0} repeated digits/pattern", charRepetitionThreshold);
        handleInvalidForm(currForm, errorMessage);
        return false;
    }

    //Validating softpin for sequence
    if (this._checkForSequence(providedSoftPIN, charSequenceThreshold)) {
        errorMessage = new GwtMessage().getMessage("Soft PIN cannot have more than {0} digits in sequence", charSequenceThreshold);
        handleInvalidForm(currForm, errorMessage);
        return false;
    }

    return true;
}

function _checkForSequence(data, threshold) {
    // Check for sequential numerical characters
    var increasingSequence = '0123456789';
    var decreasingSequence = '9876543210';
    for (var i = 0; i < data.length - threshold; i++) {
        var subData = data.substring(i, i + threshold + 1);
        if ((increasingSequence.indexOf(subData) > -1) ||
            (decreasingSequence.indexOf(subData) > -1)) {
            return true;
        }
    }
    return false;
}

function getSoftPIN(currForm) {
    var elements = currForm.elements;
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var name = element.name;

        if (name.indexOf("softpin_input") == -1) continue;
        return element;
    }
}

// If the form fails validation, this will show a message and focus the tab the form is on
function handleInvalidForm(currForm, message) {
    var tabId = 'tablabel' + currForm.elements['tab_index'].value;
    var tab = gel(tabId);
    tab.click();
    if (message)
        displayErrorMessage(message);
}

function clearSoftPINValue(element) {
    if (element.defaultValue == element.value) {
        element.value = '';
    }
}

function restoreSoftPINValue(element) {
    if ((element.defaultValue && element.value == '') || (element.value == element.defaultValue)) {
        element.value = element.defaultValue;
        var currForm = element.form;
        currForm.elements['pin_changed'].value = false;
    }
}

/**
 * Mark  the value of the passed element has changed.
 */
function softPINChanged(currElm) {
	var softPINValue = currElm.value;
	var currForm = currElm.form;
	if (!/^\**$/.test(softPINValue))
	    currForm.elements['pin_changed'].value = softPINValue != lastSubmittedSoftPin ? true : false;

}
