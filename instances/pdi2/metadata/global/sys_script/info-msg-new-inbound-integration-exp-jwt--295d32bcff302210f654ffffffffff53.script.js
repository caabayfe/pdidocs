(function executeRule(current, previous /*null when async*/ ) {

    var gURI = "";
    try {
        gURI = gs.action.getGlideURI();
    } catch (e) {
        // non-UI requests do not handle
        return;
    }

    var uri = gURI.toString();

    if (uri.indexOf("guest_embedded_client") != -1) {
        return;
    }

    // handle the UI based request, by showing the info message
    if ((gURI.toString().indexOf("oauth_jwt.do") == 0) && current.client_type != 'guest_embedded') {
        gs.addInfoMessage(gs.getMessage("switch_to_new_inbound_integration_experience_record_message"));
    }

})(current, previous);
