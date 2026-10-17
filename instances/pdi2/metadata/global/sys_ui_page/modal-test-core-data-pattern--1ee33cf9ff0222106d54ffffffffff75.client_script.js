function testExpression() {
    clearNotificationsMessages();
    // validate form values
    var expression = trim($("expression").value);
    var testValue = trim($("testValue").value);
    var type = trim($("type").value);
    var keyword = trim($("keyword").value);
    var keywordProximity = trim($("keywordProximity").value);
    var patternId = trim($("patternId").value);
    if (!expression || !testValue) {
        showError(getMessage("You must provide a regular expression and a test value"));
        document.getElementById("testValue").focus();
        return;
    }

    // validate input length
    if (testValue.length > 2048) {
        showError(getMessage("Text length can't be longer than 2048 characters"));
        document.getElementById("testValue").focus();
        return;
    }

    // validate keyword and proximity values
    if (keyword.length > 128) {
        showError(getMessage('Keyword(s) length should not exceed 128 characters.'));
        document.getElementById("keyword").focus();
        return;
    }

    if (keyword.length > 0 && (keywordProximity.length == 0 || parseInt(keywordProximity) <= 0)) {
        showError(getMessage('Keyword proximity value must be greater than 0 when keyword is configured.'));
        document.getElementById("keywordProximity").focus();
        return;
    }

    if (keywordProximity.length > 0) {
        var keywordProximityValue = parseInt(keywordProximity);
        if (keyword.length == 0) {
            showError(getMessage('Configure keyword(s) before setting keyword proximity.'));
            document.getElementById("keyword").focus();
            return;
        } else if (keywordProximityValue < 0 || keywordProximityValue > 64) {
            showError(getMessage('Keyword proximity should be in range 0 to 64.'));
            document.getElementById("keywordProximity").focus();
            return;
        }
    }

    invokeDataValidatorAPI(expression, type, testValue, keyword, keywordProximity, patternId);
    document.getElementById("testValue").focus();
}

function invokeDataValidatorAPI(regex, type, testValue, keyword, keywordProximity, patternId) {
    $j.ajax({
        requestHeaders: {
            "X-UserToken": window.g_ck
        },
        async: false,
        type: "POST",
        url: "/api/now/v1/data_pattern/test",
        data: JSON.stringify({
            regex: regex,
            type: type,
            test_value: testValue,
            keyword: keyword,
            keywordProximity: keywordProximity,
            pattern_id: patternId
        }),
        dataType: "json",
        contentType: "application/json"
    }).done(function(response) {
        if (response.result.error && response.result.error.length > 0) {
            showError(response.result.error);
            return;
        }
        if (response.result.isMatch) {
            showMatchFound(response.result.totalTime);
        } else if (response.result.luhnFailed) {
            showLuhnFailed(response.result.totalTime);
        } else {
            showMatchNotFound(response.result.totalTime);
        }
    }).fail(function(response) {
        showError(response.responseJSON.error.message);
    });
}

function clearNotificationsMessages() {
    $("notification-error").hide();
    $("notification-error-message").innerHTML = "";
    $("notification-success").hide();
    $("notification-warning").hide();
    $("notification-luhn-failed").hide();
}

function showError(errorMessage) {
    $("notification-error").show();
    $("notification-error-message").innerHTML = errorMessage;
}

function showMatchFound(totalTime) {
    $("notification-success").show();
    showTimeTaken("notification-success-message", totalTime);
}

function showMatchNotFound(totalTime) {
    $("notification-warning").show();
    showTimeTaken("notification-warning-message", totalTime);
}

function showLuhnFailed(totalTime) {
    $("notification-luhn-failed").show();
    showTimeTaken("notification-luhn-failed-message", totalTime);
}

function showTimeTaken(elementId, totalTime) {
    var msg = getMessage(" Time taken: ");
    var timeMessage = (totalTime === 0 ? "< 1 ms" : totalTime + " ms");
    var existingMsgContent = document.getElementById(elementId).textContent;
    var index = existingMsgContent.indexOf("Time taken: ");
    // Check if "Time taken: " is present in the message.
    if (index !== -1) {
        // Extract the prefix part and append the time message to the existing message content.
        var prefix = existingMsgContent.substring(0, index);
        document.getElementById(elementId).textContent = prefix + msg + timeMessage;
    } else {
        // If "Time taken: " is not found, append the time message directly.(first time when modal opens.)
        document.getElementById(elementId).textContent += msg + timeMessage;
    }
}
