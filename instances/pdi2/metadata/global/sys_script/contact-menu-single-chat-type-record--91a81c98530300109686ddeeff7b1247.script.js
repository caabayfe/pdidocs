(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('va_branding_contact_menu');
    gr.addQuery('type', 'Chat');
    gr.addQuery('branding', current.branding);
    gr.query();

    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("A record of type Chat already exists. Only one Chat menu item is supported."));
        current.setAbortAction(true);
    }
})(current, previous);
