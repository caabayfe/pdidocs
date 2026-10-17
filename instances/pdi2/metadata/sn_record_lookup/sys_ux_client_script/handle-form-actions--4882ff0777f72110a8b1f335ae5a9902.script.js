/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { name, payload : {status, screenParams}}= event;
    const { sysId } = api.context.props;
    const { isSaving } = api.state;
    if (name === 'CTRL_RECORD#SCREEN_STATUS_CHANGED'){
        api.emit('RECORD_LOOKUP#FORM_STATUS_CHANGED', event.payload);
        if (status === 'updated' || status === 'inserted') {
            api.setState('isFormModified', false);
            api.setState('isSaving', true);
            api.emit('RECORD_LOOKUP#SAVE_REQUESTED', {
                isInserting :  status === 'inserted' ? true : false,
                table : screenParams ? screenParams.table : null,
                sysId : screenParams ? screenParams.sysId : null
            });
        } else if (status === 'modified') {
            api.setState('isFormModified', true);
        } else if (status === 'unmodified') {
            api.setState('isFormModified', false);
        } 
    } else if (name === 'CTRL_RECORD#RECORD_DATA_FETCH_COMPLETED') {
        if (status === 'succeeded') {
            api.emit('RECORD_LOOKUP#FORM_DATA_FETCH_COMPLETED', {
                isSaving: (isSaving && sysId && sysId !== '-1') ? true : false,
                isCreating : sysId === '-1',
                sysId : sysId
            });
        }
        api.setState('isSaving', false);
    }
}
