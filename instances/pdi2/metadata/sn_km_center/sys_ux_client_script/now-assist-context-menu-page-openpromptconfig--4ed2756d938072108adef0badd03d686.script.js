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
        availableStyleGuides = [],
        styleGuide,
        language,
        source,
        prepopulatedInstruction = ''
    } = api.state.nacmPayload || {};

    const selectedSources = source ? [source] : [];
    const selectedLanguages = language ? [language] : [];
    const selectedStyleGuides = styleGuide ? [styleGuide] : [];

    const SOURCE_LABEL = helpers.translateSync("Source");
    const LANGUAGE_LABEL = helpers.translateSync("Language");
    const STYLE_GUIDE_LABEL = helpers.translateSync("Style guide");

    let openPromptFooterLeftSlotConfig = [{
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
                "variant": "tertiary"
            }
        }
    ];

    if (availableStyleGuides?.length > 1) {
        openPromptFooterLeftSlotConfig.push({
            "name": "style-guide-dropdown",
            "type": "now-dropdown",
            "values": {
                "name": "styleGuide",
                "bare": true,
                "items": availableStyleGuides,
                "selectedItems": selectedStyleGuides,
                "label": STYLE_GUIDE_LABEL,
                "labelPosition": "start",
                "select": "single",
                "size": "sm",
                "style": {
                    "paddingRight": "8px"
                },
                "variant": "tertiary"
            }
        });
    }

    return {
        "openPromptIntitalValue": prepopulatedInstruction,
        "openPromptFooterLeftSlotConfig": openPromptFooterLeftSlotConfig
    };
}
