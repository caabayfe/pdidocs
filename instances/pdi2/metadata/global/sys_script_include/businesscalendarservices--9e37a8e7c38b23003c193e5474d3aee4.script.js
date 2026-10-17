var BusinessCalendarServices = Class.create();
BusinessCalendarServices.prototype = {
    initialize: function() {},

    getAvailableCalendars: function() {
        var gr = new GlideRecord("business_calendar");
        gr.addQuery("is_legacy_schedule", false);
        gr.query();

        while (gr.next()) {
            answer.add(gr.calendar_name, gr.label);
        }
    },

    /* Fetch query condition for non-grouped Business Calendar.
     * This function is used as a reference qualifier in Business Calendar Group association table
     * to fetch non-grouped Calendars in order to associate one calendar with at most one group.
     */
    getNonGroupedCalendarQuery: function() {
        var ids = [];

        var gr = new GlideRecord('business_calendar');
        gr.addJoinQuery('m2m_business_calendar_group_business_calendars', 'sys_id', 'business_calendar');
        gr.query();

        while (gr.next())
            ids.push(gr.getUniqueValue());

        var gr1 = new GlideRecord('business_calendar');
        gr1.addQuery('is_legacy_schedule', 'false');
        gr1.addQuery('sys_id', 'NOT IN', ids.toString());

        return gr1.getEncodedQuery();
    },

    type: 'BusinessCalendarServices'
};
