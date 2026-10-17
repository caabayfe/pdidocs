function handler({api, event, helpers, imports}) {
    const {name, value} = event.payload;
    if (name === 'activityLogs' && value && value.size > 0) {
        const map = value.entries().next().value[1];
        const activityArray = map.activities.get('crud');
        if (activityArray.length === 0) return;
        const { operation } = activityArray[activityArray.length - 1];
        const SHNDisplayed = api.state.specialHandlingNotesDisplayed;
        if ((operation === 'inserted' || operation === 'updated') && !SHNDisplayed && api.context.props.screen.isActive) {
           api.data.get_special_handling_notes.refresh();
        }
    }
}
