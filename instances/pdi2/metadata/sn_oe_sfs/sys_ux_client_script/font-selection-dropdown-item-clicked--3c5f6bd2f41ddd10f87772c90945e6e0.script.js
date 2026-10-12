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
    const {
        dropdownItemId: assetSourceURI,
        fontSectionType
    } = event.payload;
    const {
        webClientBrandingSettings
    } = api.state;
    const brandingSettingsPayload = {};
    let columnKey;

    if (fontSectionType === 'body') {
        columnKey = 'body_font_src';
    } else if (fontSectionType === 'header') {
        columnKey = 'header_font_src';
    }

    brandingSettingsPayload[columnKey] = assetSourceURI;
    api.data.gform.nowRecordFormBlob.gForm.setValue(columnKey, assetSourceURI);
    api.setState('webClientBrandingSettings', {
        ...webClientBrandingSettings,
        ...brandingSettingsPayload
    });
}
