function transform(input) {
    var response = {};
    if (input.conversationId) {
        var requestBody = {
            "session_id": input.conversationId
        };
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        response = AnalyticsServiceInvoker.invoke("Session", "getById", requestBody);
        var caConfig = new CAConfig();

        // Setting response.user_name based on the condition
        response.user_name = caConfig.shouldShowHashedUserId() == "true" ? response.AppUserId : vaUtils.getUserName(response.AppUserId);
        var startTime = vaUtils.getUtcDateTime(vaUtils.safelyGet(response, ['StartTime', '$date'], null));
        response.StartTime.$date = startTime ? startTime.getDisplayValue() : '';
        response.StartTime.time = startTime ? startTime.getTime().getByFormat('HH:mm:ss') : '';

        var duration = response.Duration;
        if (duration) {
            var glideDateTime = new GlideDateTime();
            glideDateTime.add(duration);
            if (startTime) {
                startTime.add(duration);
                response.EndTime = {};
                response.EndTime.$date = startTime.getDisplayValue();
                response.EndTime.time = startTime.getTime().getByFormat('HH:mm:ss');
            }
            var gdt = new GlideDateTime();
            gdt.setValue(duration);
            response.Duration_formatted = gdt.getTime().getByFormat('HH:mm:ss');
            response.Duration_appsee = duration;
            response.Duration = vaUtils.getFormattedTime(duration);
        }
    }
    CIAnalyticsLogger.getLogger('AnalyticsConversationDetail').debugJson('Data broker result - {}', response);
    return response;
}
