(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const dbSysIds = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_IDS, null);
        if (dbSysIds) {
            const {
                dataBrokerDefinitions,
                eventDefinitions
            } = new DataBrokerDefinitions().getDatabrokerDefinitions(dbSysIds);
            apiHelper.getResponse({
                dataBrokerDefinitions,
                eventDefinitions
            }, BuilderToolkitConstants.ERRORS.NO_DATABROKER_DEFINITIONS);
        } else {
            const
                dataBrokerDefinitions = new DataBrokerDefinitions(null, ['name', 'description', 'sys_scope', 'private']).getBasicDataBrokerDefinitions();
            apiHelper.getResponse({
                dataBrokerDefinitions,
                eventDefinitions: []
            }, BuilderToolkitConstants.ERRORS.NO_DATABROKER_DEFINITIONS);
        }
    });

})(request, response);
