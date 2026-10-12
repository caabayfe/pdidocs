onLoad();

function onLoad() {
    var ga = new GlideAjax("MapClientCertificateUtil");
    ga.addParam("sysparm_name", "getSubjectName");
    ga.getXML(this.ajaxResponse.bind(this));
}

function ajaxResponse(serverResponse) {
    var result = serverResponse.responseXML.getElementsByTagName("result");
    if (result && result.length > 0) {
        var certDescription = result[0].getAttribute("certDescription");
        gel("certDescription").innerHTML = new GwtMessage().getMessage('{0}',certDescription);
    }
}

function ok() {
    var ajaxHelper = new GlideAjax("MapClientCertificateUtil");
    ajaxHelper.addParam("sysparm_name", "validateResponse");
    ajaxHelper.getXML(this.processResponse.bind(this));
}

function processResponse(serverResponse) {
    var result = serverResponse.responseXML.getElementsByTagName("result");
    if (result && result.length > 0) {
        var success = result[0].getAttribute("success");
        if (success == "true")
            showSuccess();
        else if (success == "already_mapped")
            showInfoAlreadypresent();
        else if (success == "already_mapped_other_user")
            showError();
        else
            showError();
    }
}

function showError() {
    var notificationContainer = gel("divNotification");
    notificationContainer.setAttribute("class", "notification notification-error");
    notificationContainer.style.display = "block";
    notificationContainer.innerHTML = new GwtMessage().getMessage("Failed to register PIV/CAC certificate to the user account.");
}

function showSuccess() {
    var notificationContainer = gel("divNotification");
    notificationContainer.setAttribute("class", "notification notification-success");
    notificationContainer.style.display = "block";
    notificationContainer.innerHTML = new GwtMessage().getMessage("The PIV/CAC certificate has been successfully registered and linked to the user account.");
    gel("register").style.display = "none";
}

function showInfoAlreadypresent() {
    var notificationContainer = gel("divNotification");
    notificationContainer.setAttribute("class", "notification notification-success");
    notificationContainer.style.display = "block";
    notificationContainer.innerHTML = new GwtMessage().getMessage("The PIV/CAC certificate is already linked to your account.");
    gel("register").style.display = "none";
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}
