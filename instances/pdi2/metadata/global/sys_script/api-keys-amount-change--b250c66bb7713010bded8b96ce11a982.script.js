(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('mid_webserver_api_key_credentials');
    gr.queryNoDomain();
    var totalApiKeys = gr.getRowCount();
    if (totalApiKeys > parseInt(current.value)) {
        gs.addErrorMessage(gs.getMessage('The current total number of API Keys is {0} which is more than the new limit of {1}. If you wish to decrease the limit, delete some API Keys so there will be no more than {1} API Keys.', [totalApiKeys, current.value]));
        current.setAbortAction(true);
    }

})(current, previous);
