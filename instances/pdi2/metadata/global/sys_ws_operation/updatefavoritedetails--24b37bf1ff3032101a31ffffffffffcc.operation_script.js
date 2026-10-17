(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    const requestBody = request.body.data; // Extract the request body
    var sysId = requestBody.sysId;
    var isFavorite = requestBody.favorite;
    var reportingFavoritesKey = 'reporting_favorites';

    if (!sysId) {
        response.setError(new sn_ws_err.NotFoundError('Provided sysid is invalid'));
        response.setStatus(400);
        return;
    }

    var user = gs.getUser();
    var favoriteValue = user.getPreference(reportingFavoritesKey) || '[]';
    var favoritesSysIds = JSON.parse(favoriteValue);

    if (isFavorite && !favoritesSysIds.includes(sysId))
        favoritesSysIds.push(sysId);
    else if (!isFavorite)
        favoritesSysIds = favoritesSysIds.filter(item => item !== sysId);


    // Update favorite preference
    user.savePreference(reportingFavoritesKey, JSON.stringify(favoritesSysIds));

    response.setStatus(200);

})(request, response);
