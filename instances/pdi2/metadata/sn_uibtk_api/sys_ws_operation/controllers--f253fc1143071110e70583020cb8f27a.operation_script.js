(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const controllerSysIds = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_IDS, null);
        if (controllerSysIds) {
            const {
                controllerDefinitions,
                dataBrokerDefinitions,
                eventDefinitions
            } = new Controller().getControllersAndDataBrokers(controllerSysIds);
            apiHelper.respondSuccesfully({
                    controllerDefinitions,
                    dataBrokerDefinitions,
                    eventDefinitions,
                },
                controllerDefinitions === {} ? 204 : 200
            );
        } else {
            const controllerDefinitions = new Controller(['name', 'description', 'sys_scope']).getBasicDetails();
            apiHelper.respondSuccesfully({
                    controllerDefinitions,
                    dataBrokerDefinitions: {},
                    eventDefinitions: [],
                },
                controllerDefinitions === {} ? 204 : 200
            );
        }
    });

})(request, response);
