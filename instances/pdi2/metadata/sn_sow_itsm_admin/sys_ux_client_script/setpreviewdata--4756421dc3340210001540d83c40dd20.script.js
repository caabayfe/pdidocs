/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    const {
        sortEvents,
        groupEvents,
        groupEventsByTimeDiff
    } = imports['sn_sow_itsm_admin.SowAdminConfigUtilsSNC']();

    const {
        getNowDateTime,
        getFormattedDateText
    } = imports['sn_sow.SOWDateTimeHelper']();
    
    function getFormattedDateTimeText(settings, timestamp) {
        let timeZone = (api.context.session.user.timeZone) ? api.context.session.user.timeZone : settings.timeZone;
        let dateFormat = (api.context.session.user.dateFormat) ? api.context.session.user.dateFormat : settings.dateFormat;
        let timeFormat = (api.context.session.user.timeFormat) ? api.context.session.user.timeFormat : settings.timeFormat;
        let dateTimeFormat = dateFormat + " " + timeFormat;

        const nowDateTime = getNowDateTime(timestamp, null, "UTC", timeZone);
        let formattedDateTimeText = getFormattedDateText(nowDateTime, null, dateTimeFormat);
        return formattedDateTimeText;
    }

    async function addFormattedDateTime(settings, events) {
        let formattedEvents = [];

        for (let idx = 0; idx < events.length; ++idx) {
            let event = events[idx];
            let formattedDateTimeText = getFormattedDateTimeText(settings, event.timestamp);
            event.formattedDateTimeText = formattedDateTimeText;
            event.formattedDateTime = formattedDateTimeText.substring(formattedDateTimeText.indexOf(' ') + 1);
            formattedEvents.push(event);
        }
        return formattedEvents;
    }

    function getTimeDiff(settings) {
        let eventGroupingInSeconds = 0;
            if (settings.eventGroupingInSeconds) {
                eventGroupingInSeconds = settings.eventGroupingInSeconds;
            } else if (settings.groupBy && settings.groupByValue) {
                eventGroupingInSeconds = (settings.groupBy === 'Hours') ? settings.groupByValue * 60 * 60: settings.groupByValue * 60; 
            } else {
                eventGroupingInSeconds = 300;
            }
        return eventGroupingInSeconds;
    }

    let settings = {};

    await aceUtils.refreshContentBlock("data_block_1");

    let blockcontext = await aceUtils.getContext();
    
    if (blockcontext && blockcontext.timelineSettings && blockcontext.timelineSettings.orderOfEvents) {
        settings = blockcontext.timelineSettings;

        let rawEvents = JSON.parse(api.state.rawTimelineEvents);

        rawEvents = await addFormattedDateTime(settings, rawEvents);
        api.setState('formattedEvents', rawEvents);

        //sort the events
        rawEvents = sortEvents(rawEvents, settings.orderOfEvents);

        //group the events
        let groupedEvents;
        
        if (settings.eventGrouping && settings.eventGrouping.enabled === true) {
            const eventGroupingInSeconds = getTimeDiff(settings.eventGrouping);
            groupedEvents = groupEventsByTimeDiff(rawEvents, eventGroupingInSeconds, settings.eventSources);
        }  else
            groupedEvents = groupEvents(rawEvents, settings.eventSources);
        //api.setState("timelineEvents", groupedEvents);
        blockcontext.showPanels = true;
        blockcontext.timelineEvents = groupedEvents;
        await aceUtils.setContext(blockcontext);
    }
}
