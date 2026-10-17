(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    function getBooleanValue(val) {
        if (String(val) !== 'true' && String(val) !== 'false')
            throw new sn_ws_err.BadRequestError('Parameter isOrderASC is invalid , isOrderASC parameter options: true or false');
        else
            return JSON.parse(val);
    }
	
    function getValue(obj, val, defaultValue) {
		var result = Array.isArray(obj[val]) ? obj[val][0] : obj[val];
        return result || defaultValue;
    }
	
    var requestBody = request.body;
    var bodyParams = requestBody.data;

    if (JSON.stringify(bodyParams) === "{}") 
        bodyParams = request.queryParams; /* Parameters came from the queryParams (REST API Explorer)*/

    var params = {
        isOrderASC: getBooleanValue(bodyParams['isOrderASC']),
        sortingColumnName: getValue(bodyParams, 'sortingColumnName', ''),
        firstRow: getValue(bodyParams, 'firstRow', 0),
        timestamp:getValue(bodyParams, 'timestamp', Date.now()),
    };

    var alertPanelManager = new sn_nocpit.AlertPanelManager();
    var responseServer = alertPanelManager.getAlertsForOperatorWorkspaceAlertPanel(params.timestamp, params.firstRow, params.sortingColumnName, params.isOrderASC);
    var responseString = String(responseServer);

    response.setStatus(200);
    response.setContentType('application/json');
    var writer = response.getStreamWriter();
    writer.writeString(responseString);
})(request, response);
