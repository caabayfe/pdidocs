function transform(input) {
    var userId = input.userId;
    var result = {};
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    if (userId) {
        var requestBody = {
            "user_id": userId
        };
        var response = AnalyticsServiceInvoker.invoke("User", "getById", requestBody);
        var caConfig = new CAConfig();

        response.user_name = caConfig.shouldShowHashedUserId() == "true" ? response.AppUserId : vaUtils.getUserName(response.AppUserId);
        //converting the given time value in milliseconds to the UTC date time object and displaying in the user selected format.
        var firstSessionTime = vaUtils.getUtcDateTime(vaUtils.safelyGet(response, ['FirstSessionTime', '$date'], null));
        var lastSessionTime = vaUtils.getUtcDateTime(vaUtils.safelyGet(response, ['LastSessionTime', '$date'], null));
        response.FirstSessionTime.$date = firstSessionTime ? firstSessionTime.getDisplayValue() : '';
        response.LastSessionTime.$date = lastSessionTime ? lastSessionTime.getDisplayValue() : '';
        result = response.Error ? {} : response;
    }
    CIAnalyticsLogger.getLogger('AnalyticsUserDetail').debugJson('Data broker result - {}', result);
    return result;
}
