var PwdEnrollSoftPINProcessor = Class.create();
PwdEnrollSoftPINProcessor.prototype = {
    category: 'password_reset.extension.enrollment_form_processor', // DO NOT REMOVE THIS LINE!
    SOFTPIN_HISTORY_CHECK_FAILED: "history_check_failed",

    /**********
     * Process the enrollment form, and returns a PwdExtensionScriptResponse object, which contains: result, message and value 
     * 
     * @param params.userId                            The sys-id of the user trying to enroll (table: sys_user)
     * @param params.verificationId                    The sys-id of the verification to be enrolled into (table: pwd_verification)
     * @param params.enrollmentId                      The sys-id of this enrollment process.
     * 
     * @param params.getFormParameter(<form element>)  Any of the form elements
     * 
     * @return a map with the attributes: 'result' and 'message' for example: {result: 'success', message : 'bla bla'}
     **********/
    process: function(params) {
	
        var enrollmentId = params.enrollmentId;
        var verificationId = params.verificationId;
        var softpin = params.getFormParameter('softpin_input') + "";
        var pinChanged = params.getFormParameter('pin_changed');
        var mandatoryVerification = params.getFormParameter('mandatory');
        var softPINManager = new SNC.PwdSoftPINManager();

        //Do no validation when there is no change in the softpin
        //Do not update/save the softpin
        if ((mandatoryVerification != 'true' && softpin == '') ||
            (pinChanged != 'true' && softpin != '')) {
            return {
                result: 'success',
                message: ''
            };
        }

        var validationResult = this._validateSoftPIN(softpin, softPINManager, verificationId);
        if (validationResult.result == 'failure')
            return validationResult;

        //Before updating we also check if this pin present in history limit(System Property - pwd_reset.softpin.history_limit) or not.
        //If softPIN exist in history then we get response as "history_check_failed".
        //In case of successful upadation, return new softPIN sysID
        var response = softPINManager.createOrUpdate(enrollmentId, softpin);
        this._handleResponse(response, validationResult, softPINManager);
        return validationResult;
    },

    _validateSoftPIN: function(softpin, softPINManager, verificationId) {

        var validationResult = {
            result: '',
            message: ''
        };
        var charRepetitionThreshold = softPINManager.getPINRepetitionThreshold(verificationId);
        charRepetitionThreshold = parseInt(charRepetitionThreshold);
        var charSequenceThreshold = softPINManager.getPINSequenceThreshold(verificationId);
        charSequenceThreshold = parseInt(charSequenceThreshold);
        var softpinLength = softPINManager.getPINLength(verificationId);
        var DEFAULT_REPETITION_THRESHOLD = 2;
        var DEFAULT_SEQUENCE_THRESHOLD = 2;

        if (isNaN(charRepetitionThreshold))
            charRepetitionThreshold = gs.getProperty('password_reset.softpin.repetition_threshold', DEFAULT_REPETITION_THRESHOLD);
        if (isNaN(charSequenceThreshold))
            charSequenceThreshold = gs.getProperty('password_reset.softpin.sequence_threshold', DEFAULT_SEQUENCE_THRESHOLD);

        //Validating softpin length & semantics
        var digitPattern = new RegExp("^\\d{" + softpinLength + "}$");
        if (!digitPattern.test(softpin)) {
            validationResult.result = 'failure';
            validationResult.message = gs.getMessage('Soft PIN should be {0} digits.', softpinLength);
            return validationResult;
        }

        //Validating softpin for repeated continuous digits
        var repetitionsPattern = "(\\d+)";
        for (var i = 0; i < charRepetitionThreshold; i++)
            repetitionsPattern += "\\1";
        var repetitionsPatternRegX = new RegExp(repetitionsPattern);
        if (repetitionsPatternRegX.test(softpin)) {
            validationResult.result = 'failure';
            validationResult.message = gs.getMessage("Soft PIN cannot have more than {0} repeated digits/pattern.", charRepetitionThreshold + '');
            return validationResult;
        }

        //Validating softpin for sequence
        if (this._checkForSequence(softpin, charSequenceThreshold)) {
            validationResult.result = 'failure';
            validationResult.message = gs.getMessage("Soft PIN cannot have more than {0} digits in sequence.", charSequenceThreshold + '');
            return validationResult;
        }
        return validationResult;
    },

    _handleResponse: function(response, validationResult, softPINManager) {
        var result = "failure";
        var message = "";

        if (gs.nil(response)) {
            message = gs.getMessage("Soft PIN update failed. Please try again.");
        } else if (response == this.SOFTPIN_HISTORY_CHECK_FAILED) {
            var historyLimit = softPINManager.getSoftPINHistoryLimit();
            message = historyLimit === 1 ? gs.getMessage("You can't use your previous Soft PIN.") : gs.getMessage("You can't reuse your previous {0} Soft PINs.", historyLimit);
        } else {
            result = "success";
            message = gs.getMessage('Soft PIN enrolled successfully');
        }
        validationResult.result = result;
        validationResult.message = message;
    },

    _checkForSequence: function(data, threshold) {
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
    },

    type: 'PwdEnrollSoftPINProcessor'
};
