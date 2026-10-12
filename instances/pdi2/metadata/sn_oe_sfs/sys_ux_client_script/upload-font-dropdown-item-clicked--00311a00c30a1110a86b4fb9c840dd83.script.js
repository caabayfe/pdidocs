/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {id} = event.payload.item;
    api.emit('CREATE_FONT_DROPDOWN_ITEM_CLICKED', {
        dropdownItemId: id,
        fontSectionType: api.context.props.fontApplicationSection
    });
}
