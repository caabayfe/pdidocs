(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const utils = new UXAApplicationUtils();
    return utils.getAllAppsForUser({ sortOrder: 'ASC' });

})(request, response);
