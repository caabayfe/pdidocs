function onLoad() {
    var internalClient = (g_form.getViewName() == 'default' || g_form.getViewName() == 'guest_embedded_client');
    var clientSecretField = g_form.getControl("client_secret");
    var redirect_url = "redirect_url";
    var redirectUrlField = g_form.getControl(redirect_url);

    var clientSecretMessage = new GwtMessage().getMessage("The recommended minimum client secret length is 32", "info");
    if (internalClient) {
        if (g_scratchpad.showClientSecretLengthWarning == true)
            g_form.addWarningMessage(g_scratchpad.clientSecretWarningMessage);

        var scopeRestrictionStatus = g_form.getValue('scope_restriction_status');
        if (scopeRestrictionStatus == 'useraccount')
            g_form.setReadOnly('scope_restriction_status', true);
        else {
			
            g_form.removeOption('scope_restriction_status', 'useraccount');
        }
        g_form.setReadOnly("client_id", true);
        if (g_form.isNewRecord()) {
            g_form.setValue('scope_restriction_status', 'restricted');
            g_form.setValue("type", "client");
            g_form.showFieldMsg("client_secret", new GwtMessage().getMessage("Leave Client Secret blank to automatically generate a string", "info"));
        }
        clientSecretField.onkeyup = clientSecretFieldLevelAlert;
        clientSecretField.onchange = clientSecretFieldLevelAlert;
    } else {
        g_form.setReadOnly("client_id", false);
        g_form.setMandatory("token_url", true);
        g_form.setMandatory("client_id", true);
        g_form.setMandatory("client_secret", true);
        if (g_form.isNewRecord()) {
            g_form.setValue("type", "oauth_provider");
            g_form.setValue("client_id", "");
            g_form.setReadOnly("client_id", false);
        }
	var refreshTokenUrl = g_form.getValue('refresh_token_url');
	if (!refreshTokenUrl || refreshTokenUrl == '')
	    g_form.setDisplay('refresh_token_url', false);

    }
    if (redirectUrlField) {
        validateUrl(redirect_url);
    }
    redirectUrlField.onkeyup = function() {
        validateUrl(redirect_url);
    };
    redirectUrlField.onchange = function() {
        validateUrl(redirect_url);
    };

    g_form.setDisplay("type", false);
    g_form.setReadOnly("type", true);
    createClientSecretCopyButton();

    function clientSecretFieldLevelAlert() {
        var clientSecretVal = clientSecretField.value || '';
        g_form.hideFieldMsg('client_secret', false);
        if (clientSecretVal.length < 32)
            g_form.showFieldMsg('client_secret', clientSecretMessage, "warning");
    }

    function validateUrl(fieldName) {
        g_form.hideFieldMsg(fieldName, false);
        var fullURL = g_form.getValue(fieldName);
        var warningMsg = new GwtMessage().getMessage("Please enter valid URL(s) separated by commas.", "warning");
		
        if (fullURL) {
            var urls = fullURL.split(',');
            for (var i = 0; i < urls.length; i++) {
                var trimmedUrl = urls[i].trim();
                var urlType = checkIfIpOrUrl(trimmedUrl);
                var isIpInvalid = urlType === 'IP' && !isValidIp(trimmedUrl);
                var isUrlInvalid = urlType === 'URL' && !isValidUrl(trimmedUrl);
                var shouldAlert = isIpInvalid || isUrlInvalid || trimmedUrl.includes('#');
                if (shouldAlert || !trimmedUrl) {
                    g_form.showFieldMsg(fieldName, warningMsg, "warning");
					break;
                }
            }
        }
    }
}

function createClientSecretCopyButton() {
    var tableName = g_form.getTableName();
    var clientSecretField = document.getElementById(tableName + '.client_secret');
    var passwordToggleButton = document.getElementById(tableName + '.client_secret.password-toggle');

    if (clientSecretField && passwordToggleButton) {
        if (!document.getElementById('copyClientSecretButton')) {
            var copyButton = document.createElement('button');
            copyButton.id = 'copyClientSecretButton';
            copyButton.className = 'btn btn-default btn-ref';
            copyButton.title = 'Copy Client Secret';
            copyButton.innerHTML = "<span class='icon icon-copy' aria-hidden='true'></span>";

            passwordToggleButton.parentNode.appendChild(copyButton);

            copyButton.addEventListener('click', function(event) {
                event.preventDefault();
                var sysId = g_form.getUniqueValue();

                var ga = new GlideAjax('Password2AjaxSupport');
                ga.addParam('sysparm_name', 'getClearPassword2');
                ga.addParam('sysparm_table_name', tableName);
                ga.addParam('sysparm_field_name', 'client_secret');
                ga.addParam('sysparm_sys_id', sysId);

                ga.getXML(function(response) {
                    var answer = response.responseXML.documentElement.getAttribute('answer');
                    if (answer && answer.length > 0) {
                        navigator.clipboard.writeText(answer);
                    }
                });
            });
        }
    }
}

function checkIfIpOrUrl(input) {
    var ipRegex = /^(?:https?:\/\/)?((\d{1,3}\.){3}\d{1,3})(?::(\d{1,5}))?(?:\/.*)?$/;
    return ipRegex.test(input) ? 'IP' : 'URL';
}

function isValidIp(input) {
    var ipv4UrlPattern = /^(?:https?:\/\/)?((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})(?::([0-9]{1,5}))?(?:\/[^\s]*)?$/;
    return ipv4UrlPattern.test(input);
}

function isValidUrl(trimmedUrl) {
    var standardUrlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
    var customUrlRegex = /^(?!https?:\/\/|www\.)[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s]*$/;
    var localhostPattern = /^(?:(?:https?:\/\/localhost(?::\d{1,5})?(?:\/[^\s]*)?)|(?:localhost:\d{1,5}(?:\/[^\s]*)?))$/;
    var isLocalHost = trimmedUrl.includes("localhost");
    var isValidUrl = isLocalHost ? localhostPattern.test(trimmedUrl) : (standardUrlRegex.test(trimmedUrl) || customUrlRegex.test(trimmedUrl));
    var wwwWithoutSecondDot = !isLocalHost && trimmedUrl.startsWith("www.") && (trimmedUrl.match(/\./g) || []).length < 2;
    return isValidUrl && !wwwWithoutSecondDot;
}

function addAlertMessage(warningMessage) {
    g_form.showFieldMsg(fieldName, warningMessage, "warning");
}
