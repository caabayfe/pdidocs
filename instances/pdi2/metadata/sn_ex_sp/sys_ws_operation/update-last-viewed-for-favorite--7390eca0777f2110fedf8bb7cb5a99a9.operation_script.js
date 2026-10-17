(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var queryParams = request.queryParams;
    var table = queryParams.table.toString();
    var recordId = queryParams.recordId.toString();
    var favoriteApi = new sn_ex_sp.FavoriteAPI();
    try {
        favoriteApi.updateLastViewedForFavorite(table, recordId);
        response.setStatus(200);
    } catch (err) {
        response.setStatus(400);
    }
})(request, response);
