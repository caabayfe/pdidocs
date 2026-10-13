function transform(input) {
    var userId = input.userId;
    var isFavorite = input.isFavorite;
    var result = {};
    if (userId) {
        var requestBody = {
            "user_id": userId,
            "is_favorite": isFavorite
        };
        var response = AnalyticsServiceInvoker.invoke("User", "updateIsFavorite", requestBody);
        result = response.Error ? {} : response;
    }
    CIAnalyticsLogger.getLogger('UpdateUserIsFavorite').debugJson('Data broker result - {}', result);
    return result;
}
