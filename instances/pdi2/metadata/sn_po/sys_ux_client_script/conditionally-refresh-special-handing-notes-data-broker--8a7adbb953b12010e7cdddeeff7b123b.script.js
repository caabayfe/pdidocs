function handler({ api, event, helpers, imports }) {
    const { name } = event.payload;
    if (name != 'activityLogs')
        return;

    const activityLogsMap = api.context.props.activityLogs;
    if (activityLogsMap.size === 0)
        return;

    var activityEntries = Array.from(activityLogsMap.values());

    //Only fetch the lastest activity entry
    const activityEntry = activityEntries[activityEntries.length - 1];
    const activityArray = activityEntry.activities.get('crud');
    if (activityArray.length === 0)
        return;

    const SHNDisplayed = api.state.specialHandlingNotesDisplayed;
    const isActiveScreen = api.context.props.screen.isActive;
    //Refresh Special Handing Notes only when it's not displayed before and current screen is active
    if (SHNDisplayed || !isActiveScreen)
        return;

    //Only fetch the lastest operation
    const { operation } = activityArray[activityArray.length - 1];
    if (operation === 'inserted' || operation === 'updated') {
        api.data.get_special_handling_notes.refresh();
    }
}
