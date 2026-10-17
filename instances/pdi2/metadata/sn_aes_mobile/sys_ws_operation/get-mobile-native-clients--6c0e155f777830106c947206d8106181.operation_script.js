(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    /**
     * Intended to be used by AES users when creating mobile apps
     * Non-admins will need read access to the sys_sg_native_client table
     **/

    var grNativeClient = new GlideRecord('sys_sg_native_client');

    if (!grNativeClient.canRead()) {
        return;
    }

    if (!request.queryParams.sysparm_transaction_scope) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage("sysparm_transaction_scope query parameter is required.");
    }

    var encodedQuery = request.queryParams.sysparm_query[0] || "";

    grNativeClient.addEncodedQuery(encodedQuery);
    grNativeClient.query();
	
    var output = [];

    while (grNativeClient.next()) {
        output.push({
            sys_id: grNativeClient.getUniqueValue(),
            name: grNativeClient.getValue('name'),
            display_value: grNativeClient.getDisplayValue(),
            client_theme: grNativeClient.getValue('client_theme'),
            empty_state: grNativeClient.getValue('empty_state'),
            force_local_login: grNativeClient.getValue('force_local_login'),
            geolocation_enabled: grNativeClient.getValue('geolocation_enabled'),
            navigation: grNativeClient.getValue('navigation'),
            offline_enabled: grNativeClient.getValue('offline_enabled'),
            order: grNativeClient.getValue('order'),
            required_roles: grNativeClient.getValue('required_roles'),
            type: grNativeClient.getValue('type')
        });
    }

    return output;

})(request, response);
