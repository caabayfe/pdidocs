(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var clientType = request.pathParams.clientType;
        var inboundId = request.pathParams.externalId;
        var SLACK_PROVIDER_SYSID = '41a04c42731210104049dec2c4f6a706';

        var current = new GlideRecord('sys_cs_provider_application');
        current.addQuery('inbound_id', inboundId);
        current.addQuery('provider', SLACK_PROVIDER_SYSID);
        current.query();
        if (current.next()) {
            var req = new sn_ws.RESTMessageV2();
            req.setEndpoint('https://slack.com/api/team.info');
            req.setHttpMethod('get');
            var e = new GlideEncryptionUtil();
            var authToken = e.getClearPassword2('token_verification', 'token', current.message_auth.outbound_message_creation);
            if (JSUtil.notNil(authToken))
                req.setRequestHeader('Authorization', 'Bearer ' + authToken);
            var resp = req.execute();
            return JSON.parse(resp.getBody()).team.name;
        }
    } catch (ex) {
        gs.error('Error getting slack team info: ' + ex.getMessage());
    }
})(request, response);
