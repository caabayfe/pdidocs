/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let {elementId, payload:{items}} = event;
    const {
        webClientBrandingSettings
    } = api.state;
    let columnKey = elementId === 'chat_header_font_size' ? 'chat_header_font_size' : 'chat_body_font_size';
    const brandingSettingsPayload = {};
    const fontPropName = columnKey+'_multiplier';
    brandingSettingsPayload[fontPropName] = items[0].id;
    api.data.gform.nowRecordFormBlob.gForm.setValue(columnKey, items[0].id);
    api.setState('webClientBrandingSettings', {
        ...webClientBrandingSettings,
        ...brandingSettingsPayload
    });
}
