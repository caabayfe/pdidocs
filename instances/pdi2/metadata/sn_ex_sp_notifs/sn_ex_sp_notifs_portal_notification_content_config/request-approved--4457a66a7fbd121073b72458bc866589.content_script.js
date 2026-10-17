(function(current, eventName, eventParm1, eventParm2, previousActors) {
    /**
     * Generates a notification object based on the provided parameters.
     * @param {GlideRecord} current - Reference to the table record
     * @param {string} eventName - Name of the event that triggered the notification.
     * @param {string} eventParm1 - First parameter related to the event.
     * @param {string} eventParm2 - Second parameter related to the event.
     * @param {Array} previousActors - List of previous actors who have triggered this notification.
     * 
     * @returns {Object} Notification object containing the following properties:
     * - actor: Sys ID of the user who triggered this notification.
     * - messageContentTemplate: A translatable template for the notification message content.
     * - messageContentParams: An string parameters to be inserted into the message content template.
     * - aggregatedContentTemplate: A translatable template for aggregated notification content.
     * - aggregatedContentParams: An array of parameters to be inserted into the aggregated content template.
     * - actionUrl: URL for navigation when the notification is clicked.
     */
    var shortDescription = current.getValue("short_description");
    var requestNumber = current.number.getDisplayValue();
    var messageTemplate = '';
    var messageParams = [];
    var approver;
    var approverGR = new GlideRecord('sysapproval_approver');
    approverGR.addQuery('sysapproval', current.sys_id); // link to the request sys_id
    approverGR.addQuery('state', 'approved');
    approverGR.query();

    if (approverGR.next())
        approver = approverGR.approver.getDisplayValue();

    if (gs.nil(approver)) {
        messageTemplate = 'Request {0} was approved';
        messageParams = [requestNumber];
    } else {
        var hasShortDesc = !gs.nil(shortDescription);
        messageTemplate = hasShortDesc ?
            '{0} approved your request for {1} {2}' :
            '{0} approved your request {1}';
        messageParams = hasShortDesc ? [approver, shortDescription, requestNumber] : [approver, requestNumber];
    }
    return {
        actor: eventParm1,
        messageContentTemplate: messageTemplate,
        messageContentParams: messageParams,
        aggregatedContentTemplate: '',
        aggregatedContentParams: [],
        actionUrl: "/esc?id=order_status&table=sc_request&sys_id=" + current.sys_id
    };
})(current, eventName, eventParm1, eventParm2, previousActors);
