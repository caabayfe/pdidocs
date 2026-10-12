var SoftPINEnrollmentManager = Class.create();
SoftPINEnrollmentManager.prototype = {
    ENROLLMENT_PROPERTY: 'glide.auth_factors.softpin.enrollment.enabled',

    initialize: function() {},

    _isEnrollmentDisabled: function() {
        return gs.getProperty(this.ENROLLMENT_PROPERTY, 'false') != 'true';
    },

    _enrollmentDisabledResponse: function() {
        return { result: 'failure', message: gs.getMessage('Soft PIN enrollment is currently disabled') };
    },

    createNew: function(contextParameterMap, verificationId, userId) {
        if (this._isEnrollmentDisabled())
            return this._enrollmentDisabledResponse();
        if (gs.nil(verificationId))
            return {
                result: 'failure',
                message: 'Verification is null'
            };

        var userGr = new GlideRecord("sys_user");
        if (gs.nil(userId) || !userGr.get(userId))
            return {
                result: 'failure',
                message: 'User id is null or invalid for enrollment'
            };

        if (gs.nil(contextParameterMap))
            contextParameterMap = {};

        //populate the form parameters:
        var params = {};
        try {
            this._popluateFormContextParams(contextParameterMap, params);
            var softPin = params['softpin_input'];
            var enrollId = this._updateEnrollmentRecord(userId, verificationId, '0');
            if (gs.nil(enrollId)) {
                return {
                    result: 'failure',
                    message: 'Failed to create enrollment for user'
                };
            }

            // Validate Soft PIN
            var validationResult = this._validateSoftPIN(softPin, verificationId);
            if (validationResult.result == 'failure')
                return validationResult;

            var softPINManager = new SNC.SoftPINManager();
            var response = new SNC.SoftPINEnrollmentManager().createOrUpdate(enrollId, softPin);
            this._handleResponse(response, validationResult);

            if (validationResult.result == 'success') {
                var softPINSysId = softPINManager.getSoftPINByVerificationId(userId, verificationId);
                if (!gs.nil(softPINSysId))
                    this._updateEnrollmentRecord(userId, verificationId, '1');
            }

            return validationResult;
        } catch (err) {
            gs.error("SoftPIN Enrollment failed" + err);
            return {
                result: 'failure',
                message: 'Enrollment failed for user; Reason: ' + err
            };
        }
    },

    createNewSP: function(verificationId, userId, softPin) {
        if (this._isEnrollmentDisabled())
            return this._enrollmentDisabledResponse();
        if (gs.nil(verificationId))
            return {
                result: 'failure',
                message: 'Verification is null'
            };

        var userGr = new GlideRecord("sys_user");
        if (gs.nil(userId) || !userGr.get(userId))
            return {
                result: 'failure',
                message: 'User id is null or invalid for enrollment'
            };

        var enrollId = this._updateEnrollmentRecord(userId, verificationId, '0');
        if (gs.nil(enrollId)) {
            return {
                result: 'failure',
                message: 'Enrollment failed'
            };
        }

        try {
            // Validate Soft PIN
            var validationResult = this._validateSoftPIN(softPin, verificationId);
            if (validationResult.result == 'failure')
                return validationResult;

            var softPINManager = new SNC.SoftPINManager();
            var response = new SNC.SoftPINEnrollmentManager().createOrUpdate(enrollId, softPin);
            this._handleResponse(response, validationResult);

            if (validationResult.result == 'success') {
                var softPINSysId = softPINManager.getSoftPINByVerificationId(userId, verificationId);
                if (!gs.nil(softPINSysId))
                    this._updateEnrollmentRecord(userId, verificationId, '1');
            }

            return validationResult;
        } catch (err) {
            gs.error("SoftPIN Enrollment failed" + err);
            return {
                result: 'failure',
                message: 'Enrollment failed for user; Reason: ' + err
            };
        }
    },

    // Updates the record with userId and verification Id.
    _updateEnrollmentRecord: function(userId, verificationId, status) {
        if (gs.nil(userId) || gs.nil(verificationId))
            return;
        var sysId;
        if (!this._doesEnrollmentRecordExist(userId, verificationId))
            sysId = new SNC.SoftPINEnrollmentManager().createEnrollment(userId, verificationId, status);
        else
            sysId = new SNC.SoftPINEnrollmentManager().updateEnrollment(userId, verificationId, status);
        return sysId;
    },

    _popluateFormContextParams: function(obj, params) {
        var value;
        for (var key in obj) {
            value = obj[key];
            params[key] = value;
        }
    },

    // Returns true if an enrollment record already exists (separate 'update' from 'insert')
    _doesEnrollmentRecordExist: function(userId, verificationId) {
        var gr = new GlideRecord('pwd_enrollment');
        gr.addQuery('verification', verificationId);
        gr.addQuery('user', userId);
        gr.query();
        return gr.hasNext();
    },

    _validateSoftPIN: function(softpin, verificationId) {
        var softPINManager = new SNC.SoftPINManager();
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

    _checkForSequence: function(data, threshold) {
        var dataValue = String(data);
        // Check for sequential numerical characters
        var increasingSequence = '0123456789';
        var decreasingSequence = '9876543210';
        for (var i = 0; i < dataValue.length - threshold; i++) {
            var subData = dataValue.substring(i, i + threshold + 1);
            if ((increasingSequence.indexOf(subData) > -1) ||
                (decreasingSequence.indexOf(subData) > -1)) {
                return true;
            }
        }
        return false;
    },

    _handleResponse: function(response, validationResult) {
        var softPINManager = new SNC.SoftPINManager();
        var softPINCheck = "history_check_failed";
        var result = "failure";
        var message = "";

        if (gs.nil(response)) {
            message = gs.getMessage("Soft PIN update failed. Please try again.");
        } else if (response == softPINCheck) {
            var historyLimit = softPINManager.getSoftPINHistoryLimit();
            message = historyLimit === 1 ? gs.getMessage("You can't use your previous Soft PIN.") : gs.getMessage("You can't reuse your previous {0} Soft PINs.", historyLimit);
        } else {
            result = "success";
            message = gs.getMessage('Soft PIN enrolled successfully');
        }
        validationResult.result = result;
        validationResult.message = message;
        return validationResult;
    },

    type: 'SoftPINEnrollmentManager'
};
