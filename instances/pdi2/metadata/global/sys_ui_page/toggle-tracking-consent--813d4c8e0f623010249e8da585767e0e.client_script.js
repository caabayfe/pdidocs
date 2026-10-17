var CONSENT_GET_API_URL = "/api/now/consent/get";
var CONSENT_UPDATE_API_URL = "/api/now/consent/update";

function disableAllActions() {
	document.getElementById("user-tracking-consent-disabled-message").style.display = "block";
	document.getElementById("uxmetrics_toggle_consent").setAttribute("disabled", "disabled");
	document.getElementById("saveBtn").setAttribute("disabled", "disabled");
}

function updateToggleButton(consentToggleState) {
    document.getElementById("uxmetrics_toggle_consent").checked = consentToggleState;
}

function getUserConsent() {
    fetch(CONSENT_GET_API_URL, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'X-Transaction-Source': window.transaction_source,
            'X-UserToken': window.g_ck
        },
    }).then(function(res) {
        return res.text();
    }).then(
        function(text) {
            var response = JSON.parse(text).result || {};
            var trackingConsent = response["TrackingConsent"];
			var consentToggleState = response["ConsentToggleState"];
            var consentToggleIsAllowed = response["ConsentToggleIsAllowed"];

			if(trackingConsent === 'Disabled') {
				document.getElementById("privacy-link").style.display = "none";
			}

			updateToggleButton(consentToggleState);
			if(!consentToggleIsAllowed) {
				disableAllActions();
			} else {
				document.getElementById("user-tracking-consent-message").style.display = "block";
			}
			document.getElementById("analytics-toggle-container").style.display = "block";
			return;
        }
    );
}

function updateConsent() {
    var consentValue = document.getElementById("uxmetrics_toggle_consent").checked;
    if (consentValue)
        consentValue = "Y";
    else
        consentValue = "N";

    fetch(CONSENT_UPDATE_API_URL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-Transaction-Source': window.transaction_source,
            'X-UserToken': window.g_ck
        },
        body: JSON.stringify({
            user_consent: consentValue
        })
    }).then(function() {
        location.reload();
    });
}

window.addEventListener('load', function(event) {
    getUserConsent();
});
