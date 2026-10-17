/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
	//Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
	const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    
    const {
            sortEvents,
            groupEvents,
            groupEventsByTimeDiff
        } = imports['sn_sow_itsm_admin.SowAdminConfigUtilsSNC']();
        
    const {eventName, eventPayload} = event.payload;
    
    let blockcontext = await aceUtils.getContext();
    let order = (blockcontext.timelineSettings.orderOfEvents) ? blockcontext.timelineSettings.orderOfEvents : "asc";
    let groupBy = (blockcontext.timelineSettings.eventGrouping.groupBy) ? blockcontext.timelineSettings.eventGrouping.groupBy : "Mins";
    let eventGrouping = (blockcontext.timelineSettings.eventGrouping.enabled) ? blockcontext.timelineSettings.eventGrouping.enabled : false;
    let groupByValue = (blockcontext.timelineSettings.eventGrouping.groupByValue) ? blockcontext.timelineSettings.eventGrouping.groupByValue : 5;

    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName === "milestones-info-clicked") {
        //open event sources incident milestones modal
        aceUtils.openModal("31bf-6ae4-89a99b-687e-8b997eb9");
    } else if ((eventName === "milestones-modal-clicked") || (eventName === "activitystream-modal-clicked")) {
        if (eventName === "activitystream-modal-clicked")
            aceUtils.dismissModal("fedc-fea4-bba8b8-699b-8a8add98");
        else
            aceUtils.dismissModal("31bf-6ae4-89a99b-687e-8b997eb9");
    } else if ((eventName === "activityStream-checked")) {
        blockcontext.timelineSettings.eventSources.activityStream = eventPayload.value;
        await aceUtils.setContext(blockcontext);
    } else if (eventName !== "save=button-clicked") {
        if (eventName === "groupby-selected") {
            groupBy = (eventPayload.value[0] === 0) ? "Mins" : "Hours";
            groupByValue = (groupBy === "Hours") && (groupByValue > 24) ? 24 : groupByValue;
            blockcontext.timelineSettings.eventGrouping.groupBy = groupBy;
            blockcontext.timelineSettings.eventGrouping.groupByValue = groupByValue;
        } else if (eventName === "groupbyvalue-selected") {
            blockcontext.timelineSettings.eventGrouping.groupByValue = eventPayload.value[0];
            groupByValue = eventPayload.value[0];
        } else if (eventName === "event-grouping-clicked") {
            blockcontext.timelineSettings.eventGrouping.enabled = eventPayload.value;
            eventGrouping = eventPayload.value;
        } else if (eventName === "orderof-events-clicked") {
            blockcontext.timelineSettings.orderOfEvents = eventPayload.value;
            order = eventPayload.value;;
        } else if (eventName === "milestones-checked") {
            blockcontext.timelineSettings.eventSources.milestones = eventPayload.value;
        }

        let eventGroupingInSeconds = (groupBy === "Hours") ? groupByValue * 60 * 60 : groupByValue * 60;
        blockcontext.timelineSettings.eventGrouping.eventGroupingInSeconds = eventGroupingInSeconds;

        await aceUtils.setContext(blockcontext);
        
        let sortedEvents = sortEvents(api.state.formattedEvents, order);

        let groupedEvents;

        if (eventGrouping === true) {
            groupedEvents = groupEventsByTimeDiff(sortedEvents, eventGroupingInSeconds, blockcontext.timelineSettings.eventSources);
        }  else
            groupedEvents = groupEvents(sortedEvents, blockcontext.timelineSettings.eventSources);

        blockcontext.timelineEvents = groupedEvents;

        await aceUtils.setContext(blockcontext);

        await aceUtils.refreshContentBlock();
    }
}
