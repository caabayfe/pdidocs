(function(context) {
    var startDate = context.pageParams.startDate;
    var endDate = context.pageParams.endDate;
    if (startDate && endDate) {
        context.props_details.data = new VaAdminConsoleMetrics().getActiveUsers(startDate, endDate);
    }
})(context);
