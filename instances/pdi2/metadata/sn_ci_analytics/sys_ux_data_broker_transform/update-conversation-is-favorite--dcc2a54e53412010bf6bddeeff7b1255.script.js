function transform(input) {
    var sessionId = input.sessionId;
    var userId = input.userId;
    var isFavorite = input.isFavorite;
    var result = {};
    if (sessionId && userId) {
        var requestBody = {
            "session_id": sessionId,
            "user_id": userId,
            "is_favorite": isFavorite
        };
        var response = AnalyticsServiceInvoker.invoke("Session", "updateIsFavorite", requestBody);
        result = response.Error ? {} : response;
    }
    CIAnalyticsLogger.getLogger('UpdateConversationIsFavorite').debugJson('Data broker result - {}', result);
    return result;
}
