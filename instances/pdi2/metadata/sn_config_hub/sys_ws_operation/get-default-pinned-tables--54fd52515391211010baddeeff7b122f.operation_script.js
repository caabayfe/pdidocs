(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    let result = getDefaultPref();
    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

    function getDefaultPref() {
        const prefName = 'configuration_hub.default_console.pinned_tables';
        const userPrefGr = new GlideRecord('sys_user_preference');
        userPrefGr.addNullQuery('user');
        userPrefGr.addQuery('system', true);
        userPrefGr.query();
        if (!userPrefGr.get('name', prefName)) {
            gs.warn('[CONFIGURATION_HUB] could not find the default pinned tables user preference');
            return null;
        } else
            return {
                [prefName]: userPrefGr.value
            };
    }

})(request, response);
