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
    var tableGr = new GlideRecord(current.source_table);
    return {
        actor: eventParm1,
        messageContentTemplate: 'You have been assigned an approval for {0} from {1} {2}',
        messageContentParams: [tableGr.getLabel(), current.document_id.requested_for.getDisplayValue(), current.sysapproval.getDisplayValue()],
        aggregatedContentTemplate: '',
        aggregatedContentParams: [],
        actionUrl: '/esc?id=hrm_todos_page&todo=' + current.getValue("sys_id")
    };
})(current, eventName, eventParm1, eventParm2, previousActors);
