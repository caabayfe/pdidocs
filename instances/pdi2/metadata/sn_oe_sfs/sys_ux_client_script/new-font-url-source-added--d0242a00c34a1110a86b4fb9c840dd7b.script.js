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
    let urlFontNameColumnKey, urlFontAddressColumnKey;
    const {
        fontCreationSectionType
    } = api.state;
    const {
        action,
        fontName,
        fontAddress
    } = event.payload;
    const urlBasedFontData = { ...api.state.urlBasedFontData };

    if (action === 'apply') {
        switch (fontCreationSectionType) {
            case 'header':
                {
                    urlFontNameColumnKey = 'header_font_name';
                    urlFontAddressColumnKey = 'header_font_src';
                    api.setState('selectedHeaderFont', [fontAddress]);
                    break;
                }

            case 'body':
                {
                    urlFontNameColumnKey = 'body_font_name';
                    urlFontAddressColumnKey = 'body_font_src';
                    api.setState('selectedBodyFont', [fontAddress]);
                    break;
                }
        }

        urlBasedFontData[urlFontNameColumnKey] = fontName;
        urlBasedFontData[urlFontAddressColumnKey] = fontAddress;
        api.setState('urlBasedFontData', { ...urlBasedFontData });
        api.data.gform.nowRecordFormBlob.gForm.setValue(urlFontNameColumnKey, fontName);
        api.data.gform.nowRecordFormBlob.gForm.setValue(urlFontAddressColumnKey, fontAddress);
    }
}
