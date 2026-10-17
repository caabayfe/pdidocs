function showAddYourCertificate() {
    var ga = new GlideAjax("MapClientCertificateUtil");
    ga.addParam("sysparm_name", "getCertHeader");
    ga.getXML(certResponse);

    function certResponse(serverResponse) {
        var result = serverResponse.responseXML.getElementsByTagName("result");
        if (result && result.length > 0) {
            var certHeader = result[0].getAttribute("cert");
            if (certHeader == "null")
                g_form.addErrorMessage(getMessage("Failed to register PIV/CAC certificate to the user account. Please close your browser, ensure your card is inserted and try again."));
            else {
                var gDialog = new GlideModal("cert_confirm_page", false, 650, 350);
                gDialog.setTitle(new GwtMessage().getMessage("PIV/CAC Certificate Found"));
                gDialog.render();
            }
        }
    }
}
