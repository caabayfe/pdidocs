/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {value} = event.payload;
    const itemId = value[0];
    api.emit('FONT_SELECTION_DROPDOWN_ITEM_CLICKED', {
        dropdownItemId: itemId,
        fontSectionType: api.context.props.fontApplicationSection
    });
}
