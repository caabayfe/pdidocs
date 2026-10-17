var instanceURL = window.location.origin;
var token;

function downloadICS(url, groupName, shiftName) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.setRequestHeader('X-UserToken', window.g_ck);

    xhr.onload = function() {
        if (xhr.status === 200) {
            var blob = new Blob([xhr.response], {
                type: "text/calendar"
            });
            var filename = "calendar.ics";
            if (groupName && shiftName) filename = groupName + "_" + shiftName + "_" + "calendar.ics";
            else if (groupName) filename = groupName + "_" + "calendar.ics";

            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // For IE/Edge browsers
                window.navigator.msSaveOrOpenBlob(blob, filename);
            } else {
                // For other browsers
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url); // Clean up
            }
        } else {
            showDownlaodFileError();
        }
    };

    xhr.onerror = function() {
        showDownlaodFileError();
    };

    xhr.send();
}

function showDownlaodFileError() {
    var errorMessage = new GwtMessage().getMessage("Unable to download calendar invite(.ics) file");
    alert(errorMessage);
}


var onDownloadClick = function() {
    var groupId = "$[jvar_group_id]";
    var userId = "$[jvar_user_id]";
    var rotaId = "$[jvar_rota_id]";
    if (!groupId || !userId || !rotaId) {
        alert(new GwtMessage().getMessage("Failed to download the calendar invite (.ics) file. The URL seems to be incorrect or improperly formatted. Please check the URL and try again."));
        return;
    }
    var groupName = "$[jvar_group_name]";
    var shiftName = "$[jvar_shift_name]";
    var tgtUserId = userId;
    // For downloading ical for entire on-call group
    if (rotaId == "all") {
        tgtUserId = "all";
    }
    var url = "api/now/on_call_rota/rotaUserICalendar/" + groupId + "/" + rotaId + "/" + tgtUserId;
    if (rotaId == "all") downloadICS(url, groupName);
    else downloadICS(url, groupName, shiftName);
};

var onGenerateClick = function() {
    var groupId = "$[jvar_group_id]";
    var userId = "$[jvar_user_id]";
    var rotaId = "$[jvar_rota_id]";
    if (!groupId || !userId || !rotaId) {
        alert(new GwtMessage().getMessage("Failed to generate a subscription link. The URL seems to be incorrect or improperly formatted. Please check the URL and try again."));
        return;
    }
    var ocCalendarUtilsGA = new GlideAjax('OCCalendarUtils');
    var responseBox = document.getElementById("response-box");
    var subscriptionURL = '/subscribeCalendar.do?sysparm_id=' + userId + '&sysparm_group_id=' + groupId + '&sysparm_rota_id=' + rotaId;
    getTinyURL();

    function getTinyURL() {
        ocCalendarUtilsGA.addParam('sysparm_name', 'getSubscriptionURL');
        ocCalendarUtilsGA.addParam('sysparm_subscription_url', subscriptionURL);
        ocCalendarUtilsGA.getXMLAnswer(function(tinyURL) {
            var sysParamTinyURL = tinyURL.match(/sysparm_tiny=([^&]*)/)[1];
            responseBox.style.display = "block";
            document.getElementById("response").innerText = instanceURL + "/api/now/on_call_rota/subscribeCalendar/" + sysParamTinyURL;
        });
    }
};

function copyToClipboard() {
    var generatedURL = document.getElementById("response").innerText;
    var textArea = document.createElement("textarea");
    textArea.value = generatedURL;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    var alertMessage = document.getElementById("alert-message");
    alertMessage.style.display = "block";
    setTimeout(function() {
        alertMessage.style.display = "none";
    }, 2000);
}
