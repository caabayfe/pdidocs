(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    /**
     * Creates SYS_APP records that are compatible with building Fluent Apps
     */
    try {
        var name = request.body.data.appName;
        var scope = request.body.data.scopeName;
        var description = request.body.data.description;

        gs.info('[IDE][Create Basic Application][scope:' + scope + '] name: ' + name);

        var utils = new global.IDEGlobalUtils();
        var sysId = utils.attemptCreation(name, scope, description, 'IDE');

        var result = { 'sys_id': sysId };
        response.setBody(result);
        return response.setStatus(200);
    } catch (e) {
        var errorMessage = '[IDE] Failed to create basic application';
        gs.error(errorMessage, e);
        response.setStatus(400);
        return response.setBody({ 'error': e.message });
    }
})(request, response);
