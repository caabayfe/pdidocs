/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const {
        payload: {
            notesText,
            save,
            unsavedNotesText
        }
    } = event;

    const isDirty = (typeof unsavedNotesText === 'string' && JSON.stringify(notesText) !== JSON.stringify(unsavedNotesText));

    if (!save && isDirty) {
        const notes = JSON.parse(JSON.stringify(api.state.notes));
        notes.meetingNotes = notesText;
        notes.unsavedMeetingNotes = unsavedNotesText;
        api.setState('notes', notes);
    } else if (save && isDirty) {
        let meeting_notes = JSON.stringify(unsavedNotesText);
        meeting_notes = meeting_notes.substring(1, meeting_notes.length - 1);
        api.data.update_cab_meeting_notes.execute({
            meeting_sys_id: api.context.props.meetingId,
            meeting_notes
        });
    }

}
