/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const notesText = JSON.parse(JSON.stringify(api.state.notesText));
    const unsavedNotesText = JSON.parse(JSON.stringify(event.payload.value));
    const isDirty = (JSON.stringify(notesText) !== JSON.stringify(unsavedNotesText));

    if (isDirty) {
        api.emit('CAB_MEETING#NOTES_VALUE_SET', {
            notesText,
            unsavedNotesText,
            save: false
        });

        api.setState('unsavedNotesText', unsavedNotesText);
    }
}
