(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.respondSuccesfully({
        upgradeInProgress: gs.getProperty('glide.upgrade.impending', 'false') === 'true' || gs.getProperty('glide.upgrade.version') !== null
    });

})(request, response);
