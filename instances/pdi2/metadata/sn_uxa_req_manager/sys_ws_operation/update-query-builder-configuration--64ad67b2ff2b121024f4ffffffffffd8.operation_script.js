(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
		const requestBody = request.body.data;
        const {
            name,
            appSysId,
            componentId,
            predicateComposition,
            permission
        } = requestBody;
        const canUserSaveInfo = new UXAQueryBuilderConfigurationService().savePredicateComposition(permission, name, appSysId, componentId, predicateComposition);
		const responseStatus = canUserSaveInfo === UXAConstants.QB_UPDATE_STATUS.SUCCESS ? 201 : 409;
        response.setStatus(responseStatus);
        response.setBody({
            message: canUserSaveInfo
        });
    } catch {
        response.setStatus(500);
        response.setBody({
            message: 'Error while saving data'
        });
    }
})(request, response);
