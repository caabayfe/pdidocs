(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const {
            name,
            appShellUI,
            path,
            homepage,
            roles
        } = request.body.data;
        const result = new Experience().create(name, appShellUI, path, homepage, roles);
        result === false ?
            apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_EXPERIENCE) :
            apiHelper.respondSuccesfully({experienceID: result});
    });
})(request, response);
