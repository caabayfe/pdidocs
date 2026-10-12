/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    const translateFieldMessage = async () => {
        const message = await helpers.translate('{0} has set this field to {1}', api.context.props.lastUpdatedBy, notesText);

        return [{ type: 'warning', message }];
    };

    const readOnly = !api.context.props.isEditor;
    const notesText = JSON.parse(JSON.stringify(api.context.props.meetingNotes));
    const unsavedNotesTextProp = typeof api.context.props.unsavedMeetingNotes === 'string' ? JSON.parse(JSON.stringify(api.context.props.unsavedMeetingNotes)) : null;
    const unsavedNotesTextState = api.state.unsavedNotesText;
    const unsavedNotesText = unsavedNotesTextProp ? unsavedNotesTextProp : unsavedNotesTextState;
    let notes = '';

    const isUnsavedChanges = !readOnly && typeof unsavedNotesText === 'string' && JSON.stringify(notesText) !== JSON.stringify(unsavedNotesText);
    if (isUnsavedChanges)
        notes = unsavedNotesText;
    else
        notes = notesText;

    const field = JSON.parse(JSON.stringify(api.state.baseField));
    field.meeting_notes.value = notes;
    field.meeting_notes.displayValue = notes;
    field.meeting_notes.readonly = readOnly;
    field.meeting_notes.referringRecordId = api.context.props.meetingId || '';
    if (event.payload.name === 'meetingNotes' && isUnsavedChanges)
        translateFieldMessage().then(messageConfig => {
            field.meeting_notes.messages = messageConfig;
            api.setState('displayField', field);
        });
    else
        api.setState('displayField', field);

    api.setState('notesText', notesText);
    api.setState('unsavedNotesText', unsavedNotesText);

    const cabMeetingName = api.context.props.cabMeetingName || '';
    const setShareNotes = async () => {
        const shareNotesMesg = await helpers.translate('The meeting notes will be emailed to all <b>{0}</b> attendees. Do you want to continue?', cabMeetingName);
        api.setState('shareNotesMesg', shareNotesMesg);
    };
    setShareNotes();
}
