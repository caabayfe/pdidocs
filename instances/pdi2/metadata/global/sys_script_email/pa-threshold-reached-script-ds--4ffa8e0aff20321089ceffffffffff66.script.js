(function runMailScript(current, template, email, email_action, event) {
    var json = new JSON();
    var escape = GlideStringUtil.escapeHTML;
    var reachedThresholdCheck = json.decode(event.parm1).dataSnapshot_threshold_reached;
    var scoreDate = reachedThresholdCheck.score_date;
    var indicatorDisplayValue = reachedThresholdCheck.indicator_display_value;
	var indicatorName = reachedThresholdCheck.indicator_name;
    var relativePosition = reachedThresholdCheck.position;
    var processedFilterJson = reachedThresholdCheck.processed_filter;
    var thresholdLevel = reachedThresholdCheck.thresholdLevel;
    var sourceId = reachedThresholdCheck.source_id;
    var condition = reachedThresholdCheck.condition;
    var calendarInfoJson = reachedThresholdCheck.calendar_info_json;

    var notificationMessageStart = 'The score for the ';
    var link = '<a href="' + gs.getProperty('glide.servlet.uri') +'now/platform-analytics-workspace/ac_kpi_details/' + escape(sourceId) + '/params/calendarInfo/' + escape(calendarInfoJson) + '/breakdowns/' + escape(processedFilterJson) + '/list-view/panel/threshold">';
    var notificationLinkText = indicatorDisplayValue;
    var notificationMessageEnd = '</a>';
    var notificationMessage;
    if (typeof thresholdLevel == 'undefined') {
        notificationMessage = ' had an ' + condition + ' of ' + reachedThresholdCheck.score + ' on ' + scoreDate + '.';
    } else {
        notificationMessage = ' was ' + reachedThresholdCheck.score + ' on ' + scoreDate + ', which is ' + relativePosition + ' the threshold of ' + thresholdLevel + '.';
    }
    template.print('<div>' + notificationMessageStart + link + notificationLinkText + notificationMessageEnd + notificationMessage + '</div>');
    template.print('<br>');

    email.setSubject("Threshold reached notification for " + indicatorName);

})(current, template, email, email_action, event);
