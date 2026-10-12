(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var profiles = getOauthEntityProfiles();
    response.setBody(profiles);
    response.setStatus(200);

    function getOauthEntityProfiles() {
        var result = [];
        var gr = new GlideRecord('oauth_entity_profile');
        gr.addQuery('grant_type', 'authorization_code');
        gr.query();
        while (gr.next()) {
            result.push({
                name: gr.getValue('name'),
                sys_id: gr.getValue('sys_id')
            });
        }
        return result;
    }

    return response;

})(request, response);
