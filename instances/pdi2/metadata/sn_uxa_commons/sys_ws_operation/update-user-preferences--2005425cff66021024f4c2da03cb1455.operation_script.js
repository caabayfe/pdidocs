(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const uxaPageFilterProcessor = new sn_uxa_commons.UXAPageFilterProcessor();
    try {
        const {
            appSysId,
            selectedItems,
            componentId
        } = request.body.data;
        const updatedStatus = uxaPageFilterProcessor.updateUserFilterPreferences({
            appSysId,
            selectedItems,
            componentId
        });
        response.setStatus(200);
        response.setBody(updatedStatus);
    } catch (ex) {
        gs.error('Error' + ex.message);
        response.setStatus(500);
        response.setBody({
            'error': 'Error updating the user selected filters',
        });
    }

})(request, response);
