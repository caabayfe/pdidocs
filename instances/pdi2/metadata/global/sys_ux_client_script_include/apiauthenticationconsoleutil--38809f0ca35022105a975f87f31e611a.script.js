function include({imports}) {
    return {
        showNotification: _showNotification,
        disableSave: _disableSave,
        isSameScopesAndAPIs: _isSameScopesAndAPIs,
        areAPIsSame: _areAPIsSame,
        copyToClipboard: _copyToClipboard,
        showClientSecretNotification : _showClientSecretNotification,
        getClientSecretFieldLevelAlert :  _getClientSecretFieldLevelAlert,
        validateURL: _validateURL,
       getScopeRestrictionInfo :  _getScopeRestrictionInfo
    };

    function _showNotification(api, id, type, message) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: id,
                status: type,
                icon: 'info-circle-outline',
                content: message,
                action: {
                    type: 'dismiss'
                },
                textLinkProps: {}
            }]
        });
    };

    function _disableSave(api, fromDB, fromForm) {
        var disableSave = true;
        for (var key in fromForm) {
            if (key == "scopesAndAPIs") {
                if (!_isSameScopesAndAPIs(api.state.initialScopesAndAPI, fromForm[key])) {
                    disableSave = false;
                    break;
                }
                continue;
            }
            if (fromDB[key] != fromForm[key]) {
                disableSave = false;
                break;
            }
        }
        return disableSave;
    };

    function _isSameScopesAndAPIs(initialScopesAndAPIs, currentScopesAndAPIs) {
        var initialScopesAndAPIsLength = Object.values(initialScopesAndAPIs).length;
        var currentScopesAndAPIsLength = Object.values(currentScopesAndAPIs).length;
        var initialCopy = {};
        var currentCopy = {};
        for (var key in initialScopesAndAPIs) {
            initialCopy[initialScopesAndAPIs[key]["selectedScope"]] = {...initialScopesAndAPIs[key]};
        }
        for (var key in currentScopesAndAPIs) {
            currentCopy[currentScopesAndAPIs[key]["selectedScope"]] = {...currentScopesAndAPIs[key]};
        }
        if (initialScopesAndAPIsLength < currentScopesAndAPIsLength) {
            for (var key in currentCopy) {
                if (initialCopy[key] == undefined)
                    return false;
                var initialAPIs = initialCopy[key]["selectedAPIs"];
                var currentAPIs = currentCopy[key]["selectedAPIs"];
                if (_areAPIsSame(initialAPIs, currentAPIs) == false)
                    return false;
            }
        } else {
            for (var key in initialCopy) {
                if (currentCopy[key] == undefined)
                    return false;
                var initialAPIs = initialCopy[key]["selectedAPIs"];
                var currentAPIs = currentCopy[key]["selectedAPIs"];
                if (_areAPIsSame(initialAPIs, currentAPIs) == false)
                    return false;
            }
        }
        return true;
    };

    function _areAPIsSame(initialAPIs, currentAPIs) {
        var notMissed = true;
        initialAPIs.filter(x => {
            for (var key in currentAPIs) {
                if (x["id"] == currentAPIs[key]["id"])
                    return true;
            }
            notMissed = false;
            return false;
        });
        if (notMissed == false) return notMissed;
        currentAPIs.filter(x => {
            for (var key in initialAPIs) {
                if (x["id"] == initialAPIs[key]["id"])
                    return true;
            }
            notMissed = false;
            return false;
        });
        return notMissed;
    };

    async function _showClientSecretNotification(api, event, helpers, clientSecretAutoGenLength, clientSecretFieldValueLength) {
        const clientSecretType1Msg = await helpers.translate("The recommended minimum client secret length is now 32 characters. Update it manually or set the system property \"{0}\" to 32 or more, clear the field, and save to auto-generate a new one.", "com.glide.oauth.client_secret.auto_generate_length");
        const clientSecretType2Msg = await helpers.translate("The recommended minimum client secret length is now 32. Either update it manually or clear the field and save to auto-generate a new one.");
        if (clientSecretAutoGenLength < 32 && clientSecretFieldValueLength < 32)
            _showNotification(api, "secret_warning", "warning", clientSecretType1Msg);
        else if (clientSecretFieldValueLength < 32 && clientSecretAutoGenLength >= 32)
            _showNotification(api, "secret_warning", "warning", clientSecretType2Msg);
    };

    async function _getClientSecretFieldLevelAlert(api, helpers, clientSecretLength) {
        let alertMessages = [];
        const clientSecretFieldLevelMsg = await helpers.translate("The recommended minimum client secret length is 32");
        if (clientSecretLength < 32) {
            alertMessages.push({
                content: clientSecretFieldLevelMsg,
                icon: "circle-info-outline",
                status: "warning"
            });
        }
        return alertMessages;
    };

    function _copyToClipboard(label, value, successMessage, failureMessage, api, helpers) {
        let uniqueId = label;
        try {
            helpers.writeText(value).then((status) => {
                _showNotification(api, "copyLinkAlertSuccess_" + uniqueId, "info", successMessage);
            });
        } catch (error) {
            _showNotification(api, "copyLinkAlertFailure_" + uniqueId, "warning", failureMessage);
        }
        
        helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{
                id: "copyLinkAlertSuccess_" + uniqueId
            }, {
                id: "copyLinkAlertFailure_" + uniqueId
            }, ]
        }), 2000);
    };
	function _getScopeRestrictionInfo(status, messages) {
		let response = {};

		let highlightedValue = {};

		if(status == "unrestricted") {
			highlightedValue["label"]  = messages["broadlyScopedLabel"];
			highlightedValue["color"]  = "warning";
			response["warning"] = messages["broadlyScopedWarning"];
			response["warning_type"] = "warning";
		} else if(status == "restricted") {
			highlightedValue["label"]  = messages["securelyScopedLabel"];
			highlightedValue["color"]  = "green";
		} else if(status == "useraccount") {
			highlightedValue["label"]  = messages["useraccountScopedLabel"];
			highlightedValue["color"]  = "orange";
			response["warning"] = messages["useraccountScopedWarning"];
			response["warning_type"] = "warning";
		}


		response["highlightedValue"] = highlightedValue;
		return response;
	};
 
    function _validateURL(fieldName, fullURL, warningMessage) {
        const alertMessages = [];

        if ('redirect_url' === fieldName && fullURL) {
            const urls = fullURL.split(',');
            for (const url of urls) {
                var trimmedUrl = url.trim();
                var urlType = checkIfIpOrUrl(trimmedUrl);

                const isIpInvalid = urlType === 'IP' && !isValidIp(trimmedUrl);
                const isUrlInvalid = urlType === 'URL' && !isValidUrl(trimmedUrl);
                const shouldAlert = isIpInvalid || isUrlInvalid || trimmedUrl.includes('#') ;

		if (shouldAlert || !trimmedUrl) {
  		    addAlertMessage(alertMessages, warningMessage);
                    return alertMessages;
                }
            }
        }  
        return alertMessages;
     };

    function checkIfIpOrUrl(input) {
        const ipRegex = /^(?:https?:\/\/)?((\d{1,3}\.){3}\d{1,3})(?::(\d{1,5}))?(?:\/.*)?$/;
        return ipRegex.test(input) ? 'IP' : 'URL';
    };

    function isValidIp(input) {
       const ipv4UrlPattern = /^(?:https?:\/\/)?((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})(?::([0-9]{1,5}))?(?:\/[^\s]*)?$/;
       return ipv4UrlPattern.test(input);
    };

    function isValidUrl(trimmedUrl) {
       const standardUrlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
       const customUrlRegex = /^(?!https?:\/\/|www\.)[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s]*$/;
       const localhostPattern = /^(?:(?:https?:\/\/localhost(?::\d{1,5})?(?:\/[^\s]*)?)|(?:localhost:\d{1,5}(?:\/[^\s]*)?))$/;

       const isLocalHost = trimmedUrl.includes("localhost") ;
       const isValidUrl = isLocalHost ? localhostPattern.test(trimmedUrl) :
				      (standardUrlRegex.test(trimmedUrl) || customUrlRegex.test(trimmedUrl));

       const wwwWithoutSecondDot = !isLocalHost && trimmedUrl.startsWith("www.") && (trimmedUrl.match(/\./g) || []).length < 2;
       return isValidUrl && !wwwWithoutSecondDot;
    };

    function addAlertMessage(alertMessages, warningMessage) {
       alertMessages.push({
           content: warningMessage,
           icon: "circle-info-outline",
           status: "warning"
       });
    };
}
