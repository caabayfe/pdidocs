/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.status && event.payload.status === 'inserted') {
        api.emit('FONT_ASSET_UPLOAD_SUCCESS', {
            sysId: api.state.sysId,
            dropdown: api.context.props.fontFamilyDropdown
        });
    }
}
