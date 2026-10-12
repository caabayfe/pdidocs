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
    var userGr = new GlideRecord("sys_user");
    userGr.get(eventParm1);
    return {
        actor: eventParm1,
        messageContentTemplate: '{0} left a comment on Incident {1}',
        messageContentParams: [userGr.getDisplayValue(), current.getDisplayValue()],
        aggregatedContentTemplate: '{0} and {1} ' + (previousActors.length > 1 ? 'others' : 'other') + ' left a comment on Incident {2}',
        aggregatedContentParams: [userGr.getDisplayValue(), previousActors.length, current.getDisplayValue()],
        actionUrl: '/esc?id=ticket&table=incident&sys_id=' + current.sys_id
    };
})(current, eventName, eventParm1, eventParm2, previousActors);
