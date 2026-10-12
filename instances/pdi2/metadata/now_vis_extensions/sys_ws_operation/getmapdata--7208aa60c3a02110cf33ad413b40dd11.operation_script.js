(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    /*
    Request: Query params - table, field, mapSysId
    Response: Returns MapData with map Source field name, map JSON data and location mappings 
    */
    try {
        const queryParams = request.queryParams;
        const table = queryParams['table'] + "";
        const field = queryParams['field'] + "";
        const mapSysId = queryParams['mapSysId'];
        const mapkey = queryParams['mapKey'] + "";
        const useLatLon = (queryParams['useLatLon'] + "") == "true" ? true : false;
        const isManual = (queryParams['isManual'] + "") == "true" ? true : false;

        response.setStatus(200);
        const util = new GeomapUtil();

        if (isManual) {
            var mapParams = util.getManualDataMapParams(table, field, mapSysId + "");
            if (mapParams != null) {
                return util.getGeoMapData(table, mapParams.field, mapSysId + "", mapParams.mapKey, mapParams.useLatLon);
            }
        }

        return util.getGeoMapData(table, field, mapSysId, mapkey, useLatLon);
    } catch (err) {
        response.setStatus(200);
        gs.error(err);
        var message = err.msg != null ? err.msg : gs.getMessage('Error encountered while fetching geomap data.');
        return {
            status: 'failure',
            message: message,
            detail: err.detail,
            errorCode: err.errorCode
        };
    }
})(request, response);
