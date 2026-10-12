api.controller = function($scope, $window, $http, spUtil, $rootScope, $timeout, spAriaUtil) {
    /* widget controller */
    var c = this;
    var currentLiveMessage = '';

    $scope.reloadPage = function() {
        window.location.reload();
    };

    c.action = function() {
        c.resultMessage = '';
        $.ajax({
            url: 'xmlhttp.do',
            method: 'POST',
            data: {
                sysparm_processor: 'SoftPINAjaxProcessor',
                sysparm_name: 'enrollSP',
                sysparam_verification_id: c.data.verificationId,
                sysparam_soft_pin: c.soft_pin
            },
            headers: {
                'X-UserToken': g_ck
            },
            success: setSoftPin,
            error: function() {}
        });
    };

    c.disableSubmit = function() {
        return !(c.soft_pin) || c.errorMessage();
    };

    c.errorMessage = function() {
        var charRepetitionThreshold = c.data.pinRepetitionThreshold;
        var charSequenceThreshold = c.data.pinSequenceThreshold;
        var SOFT_PIN_LENGTH = c.data.pinLength;
        var repetitionsPattern = "(\\d+)";
        for (var i = 0; i < charRepetitionThreshold; i++)
            repetitionsPattern += "\\1";
        var repetitionsPatternRegX = new RegExp(repetitionsPattern);

        var digitPattern = new RegExp("^\\d{" + SOFT_PIN_LENGTH + "}$");
        if (c.soft_pin && c.soft_pin.length > parseInt(SOFT_PIN_LENGTH) && !digitPattern.test(c.soft_pin)) {
            sendLiveMessage(c.data.pinLengthRule);
            return c.data.pinLengthRule;
        } else if (c.soft_pin && repetitionsPatternRegX.test(c.soft_pin)) {
            //Validating softpin for repeated continuous digits
            sendLiveMessage(c.data.repetitionThresholdRule);
            return c.data.repetitionThresholdRule;
        } else if (c.soft_pin && checkForSequence(c.soft_pin, charSequenceThreshold)) {
            //Validating softpin for sequence
            sendLiveMessage(c.data.sequenceThresholdRule);
            return c.data.sequenceThresholdRule;
        } else {
            sendLiveMessage('');
            return '';
        }
    };

    function sendLiveMessage(newMessage) {
        if (newMessage != '' && newMessage != currentLiveMessage)
            spAriaUtil.sendLiveMessage(newMessage);
        currentLiveMessage = newMessage;
    }

    function checkForSequence(data, threshold) {
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

    function setSoftPin(response) {
        var docElement = response.documentElement;
        var xml = docElement.outerHTML || new XMLSerializer().serializeToString(docElement);
        var $xmlDoc = $.parseXML(xml);
        var status = $($xmlDoc).find('xml').find("_" + c.data.verificationId).attr('status');
        var message = $($xmlDoc).find('xml').find("_" + c.data.verificationId).attr('message');

        if (status == 'success') {
            c.changeSuccess = true;
            c.error = false;
        } else
            c.error = true;

        c.resultMessage = message;
        $scope.$apply();
    }

    c.renderMaskIcon = function() {
        var passwordEle = document.getElementById("soft_pin");
        var maskEle = document.getElementById("mask_icon");
        $(maskEle).tooltip('hide');
        var btnDescription = document.getElementById("btnDescription");
        var element = document.getElementsByClassName("mask_btn")[0];
        var isPasswordType = passwordEle.type === 'password';
        maskEle.classList.toggle('active', isPasswordType);
        maskEle.setAttribute('data-original-title', (isPasswordType) ? '${Hide password}' : '${Show password}');
        element.setAttribute('aria-label', (isPasswordType) ? '${Hide password}' : '${Show password}');
        passwordEle.type = (isPasswordType) ? 'text' : 'password';
        btnDescription.textContent = (isPasswordType) ? '${Password shown}' : '${Password hidden}';
    }
};
