(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams);
    var orderBy = '';
    if (typeof nameValuePairs.orderBy !== 'undefined') {
        orderBy = nameValuePairs.orderBy + '';
        delete nameValuePairs.orderBy;
    }
    orderBy = orderBy || 'name';

    var textSearch = '';
    if (typeof nameValuePairs.textSearch !== 'undefined') {
        textSearch = (nameValuePairs.textSearch + '').trim();
        delete nameValuePairs.textSearch;
    }

    var sysparm_limit = null;
    if (typeof nameValuePairs.sysparm_limit !== 'undefined') {
        sysparm_limit = nameValuePairs.sysparm_limit + '';
        delete nameValuePairs.sysparm_limit;
    }

    var sysparm_offset = null;
    if (typeof nameValuePairs.sysparm_offset !== 'undefined') {
        sysparm_offset = nameValuePairs.sysparm_offset + '';
        delete nameValuePairs.sysparm_offset;
    }

    var encodedQueryObj = global.ChangeCommon.buildEncodedQuery(global.ChangeCommon.assign({}, nameValuePairs));
    var result = global.ChangeCommon.getWindow(global.ChangeProcess.findAll(orderBy, textSearch, encodedQueryObj.encodedQuery), sysparm_limit || null, sysparm_offset || null);
    result.push({
        __meta: encodedQueryObj
    });
    return result;
})(request, response);
