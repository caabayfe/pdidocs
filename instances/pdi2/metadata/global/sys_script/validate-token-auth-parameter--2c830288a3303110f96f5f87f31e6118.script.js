(function executeRule(current, previous /*null when async*/) {
    gs.log("[TokenBasedAuthenticator]: 1 query, 1 header validation BR started ");
    var queryParamCount=0;
    var headerParamCount=0;
    var gr = new GlideRecord('sys_token_auth_parameter');
    gr.initialize();
    gr.addQuery("sys_id", "IN", current.auth_parameter);
    gr.query();
    while(gr.next()) {
        if(gr.type == "auth_header") {
            headerParamCount=headerParamCount+1;
        }
        if(gr.type == "query_parameter") {
            queryParamCount=queryParamCount+1;
        }
        if(headerParamCount>1 || queryParamCount>1) {
            gs.addErrorMessage(gs.getMessage("Only 1 query parameter and 1 header parameter is allowed."));
            current.auth_parameter = previous.auth_parameter;
            current.setAbortAction(true);
            return false;
        }
    }
})(current, previous);
