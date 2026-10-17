(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('mid_webserver_api_key_credentials');
    gr.queryNoDomain();
    var totalApiKeys = gr.getRowCount();
    if (totalApiKeys > 10) {
        gs.addErrorMessage(gs.getMessage('The current total number of API Keys is {0}, which is more than the default limit of 10. If you with to delete this property, delete some API Keys so there will be no more than 10 API Keys.', totalApiKeys));
        current.setAbortAction(true);
    }

})(current, previous);
