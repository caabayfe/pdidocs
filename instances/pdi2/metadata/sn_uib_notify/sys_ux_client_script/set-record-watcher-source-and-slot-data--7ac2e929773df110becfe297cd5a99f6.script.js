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
    const setRecordWatcherSource = () => {
        let source = '';
        let sourceIds = "";
        let participantWatcherSessionFilter = "";
        /**
         * This can be undefined on initial load when the parent data is not yet fetched,
         * Hence defaulting it to empty array to let the normal record watcher sources
         */
        const recordWatcherSourceIds = api.context.props.recordWatcherSourceIds || [];

        const initialWatcherSourceInjectionComplete = api.state.initialWatcherSourceInjectionComplete;
        if (recordWatcherSourceIds && recordWatcherSourceIds.length > 0) {
            for (const index in recordWatcherSourceIds) {
                sourceIds += `${recordWatcherSourceIds[index]},`;
                source += `source=${recordWatcherSourceIds[index]}^OR`;
                participantWatcherSessionFilter += `notify_participant.notify_conference_call.source=${recordWatcherSourceIds[index]}^OR`;
            }
        }
        source += `source=${api.context.props.sysId}`;
        sourceIds += `${api.context.props.sysId}`;
        participantWatcherSessionFilter += `notify_participant.notify_conference_call.source=${api.context.props.sysId}^notify_participant.notify_conference_callISNOTEMPTY^notify_participant.notify_conference_call.active=true^notify_participant.user.sys_id=${api.context.session.user.sys_id}`;

        /**
         * We only want to refresh the inital cards once as Notify record watchers
         * will handle the rest of the updates
         */
        if (!initialWatcherSourceInjectionComplete) {
            /**
             * This is used to refreshed the cards content with the injected source Id's
             */
            api.setState("recordWatcherSourceIds", sourceIds);
        }
        if (recordWatcherSourceIds.length > 0) {
            api.setState("initialWatcherSourceInjectionComplete", true);
        }

        api.setState("recordWatcherSource", source);
        api.setState("updatedSourceIds", sourceIds);
        api.setState("participantSessionWatcherFilter", participantWatcherSessionFilter);
        if (!api.state.subscribeWatchers) {
            api.setState("subscribeWatchers", true);
        }
    };

    const updateSlotData = async (conferenceCalls) => {
        const data = api.context.props.upcomingSlotData || [];
        const conferenceCallsData = api.data.fetch_conference_calls.output;
        if (!conferenceCallsData)
            return;
        const ACTIVE_CALL_INDEX = conferenceCallsData.conferenceCallTypeIndex.ACTIVE;
        const UPCOMING_CALL_INDEX = conferenceCallsData.conferenceCallTypeIndex.UPCOMING;
        const COMPLETED_CALL_INDEX = conferenceCallsData.conferenceCallTypeIndex.COMPLETED;
        conferenceCalls[UPCOMING_CALL_INDEX].callStatus = await helpers.translate("Pending ({0})", data.length);
        conferenceCalls[UPCOMING_CALL_INDEX].callRecords = JSON.parse(JSON.stringify(data));
        if (!conferenceCalls[ACTIVE_CALL_INDEX].callRecords.length &&
            !conferenceCalls[UPCOMING_CALL_INDEX].callRecords.length &&
            !conferenceCalls[COMPLETED_CALL_INDEX].callRecords.length) {
            api.setState("showEmptyState", true);
        } else {
            api.setState("showEmptyState", false);
        }
        api.setState("conferenceCalls", JSON.parse(JSON.stringify(conferenceCalls)));
    };

    /**
     * This script is used in prop update and page ready, When the slot data or injectied record Id's
     * Change we run the script to update watcher sources filters and upcoming slot data
     */
    if (event.name == "MACROPONENT_PROPERTY_CHANGED") {
        const propChangeName = event.payload.name;
        if (propChangeName == "recordWatcherSourceIds") {
            setRecordWatcherSource();
        } else if (propChangeName == "upcomingSlotData") {
            await updateSlotData(api.state.conferenceCalls);
        }
    } else if (event.name == "MACROPONENT_READY") {
        setRecordWatcherSource();
    }
}
