/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const isFormModified = api.state.isFormModified;
    const { name } = event;

    //Handle form cancel button clicked
    if (name === 'NOW_BUTTON#CLICKED') {
        if (isFormModified) {
            helpers.modal.open('confirm_modal');
        } else {
            api.emit('RECORD_LOOKUP#FORM_CANCEL_REQUESTED');
        }
    }

    //Handle confirm modal button clicked
    if (name === 'NOW_CONFIRM_MODAL#POSITIVE_BUTTON_CLICKED') {//discard changes
        api.setState('isFormModified', false);
        api.emit('RECORD_LOOKUP#FORM_CANCEL_REQUESTED');
    }
    
}
