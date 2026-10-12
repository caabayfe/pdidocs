/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        availableSources = [],
        availableLanguages = [],
        language,
        source
    } = api.state.nacmPayload || {};

    const selectedSources = source ? [source] : [];
    const selectedLanguages = language ? [language] : [];

    const SOURCE_LABEL = helpers.translateSync("Source");
    const LANGUAGE_LABEL = helpers.translateSync("Language");

    return {
        // "openPromptIntitalValue": "",
        "openPromptFooterLeftSlotConfig": [{
                "name": "source-dropdown",
                "type": "now-dropdown",
                "values": {
                    "name": "source",
                    "bare": true,
                    "items": availableSources,
                    "selectedItems": selectedSources,
                    "label": SOURCE_LABEL,
                    "labelPosition": "start",
                    "select": "single",
                    "size": "sm",
                    "style": {
                        "paddingRight": "8px"
                    },
                    "variant": "tertiary"
                }
            },
            {
                "name": "lang-dropdown",
                "type": "now-dropdown",
                "values": {
                    "name": "language",
                    "bare": true,
                    "items": availableLanguages,
                    "selectedItems": selectedLanguages,
                    "label": LANGUAGE_LABEL,
                    "labelPosition": "start",
                    "select": "single",
                    "size": "sm",
                    "style": {
                        "paddingRight": "8px"
                    },
                    "variant": "tertiary",
                    "disabled": true
                }
            }
        ]
    };
}
