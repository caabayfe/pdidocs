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

    var userId, userName;
    var journalGr = new GlideRecord('sys_journal_field');
    journalGr.addQuery('element_id', current.sys_id);
    journalGr.setLimit(1);
    journalGr.orderByDesc('sys_created_on');
    journalGr.query();
    if (journalGr.next() && journalGr.getValue("sys_created_by")) {
        var userGr = new GlideRecord("sys_user");
        userGr.get("user_name", journalGr.getValue("sys_created_by"));
        userName = userGr.getDisplayValue();
        userId = userGr.getValue("sys_id");
    }
    if (!gs.nil(userName)) {
        return {
            actor: userId,
            messageContentTemplate: '{0} left a comment on Requested item {1}',
            messageContentParams: [userName, current.getDisplayValue()],
            aggregatedContentTemplate: '{0} and {1} ' + (previousActors.length > 1 ? 'others' : 'other') + ' left a comment on Requested item {2}',
            aggregatedContentParams: [userName, previousActors.length, current.getDisplayValue()],
            actionUrl: "/esc?id=ticket&table=sc_req_item&sys_id=" + current.getValue("sys_id")
        };
    }

})(current, eventName, eventParm1, eventParm2, previousActors);
