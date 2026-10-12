(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var grScope = new GlideRecord('sys_scope');
    var doesScopeExist = grScope.get('scope', 'sn_app_eng_studio');
    var scopeId = doesScopeExist ? grScope.sys_id : null;
    var properties = [];

    if (!scopeId)
		throw new sn_ws_err.ServiceError()
			.setStatus(404)
			.setMessage(gs.getMessageLang('sn_app_eng_studio scope does not exist', "en"))
			.setDetail(gs.getMessage('sn_app_eng_studio scope does not exist'));

    var grProps = new GlideRecord('sys_properties');

    grProps.addQuery('sys_scope', scopeId);
    grProps.query();

    while (grProps.next()) {
        var property = {
            name: grProps.getValue('name'),
            value: grProps.getValue('value'),
            description: grProps.getValue('description')
        };

        properties.push(property);
    }

    response.setBody(properties);
    response.setStatus(200);
})(request, response);
