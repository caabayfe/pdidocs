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
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);

    try {

        function navigateToForm(table, sysId, params) {
            const payload = {
                route: 'record',
                fields: {
                    'table': table,
                    'sysId': sysId
                },
                params: params || {}
            };

            api.emit('NAV_ITEM_SELECTED', payload);
        }

        function navigateToList(table, params) {
            const payload = {
                route: 'list',
                fields: {
                    'table': table
                },
                params: params || {}
            };

            api.emit('NAV_ITEM_SELECTED', payload);
        }

        function updateWebclientSettings(updatedVal) {
            const {
                webClientBrandingSettings
            } = api.state;
            api.setState('webClientBrandingSettings', {
                ...webClientBrandingSettings,
                ...updatedVal
            });
        }

        function isValidThemeAssetAddress(uri) {
            const regex = /\/uxta\/[a-zA-Z0-9]{32}\.assetx/g;
            return regex.test(uri);
        }

        switch (event.name) {
            //gform fetches data (onload)
            case 'SN_FORM_DATA_CONNECTED#WRAPPED_ACTION':
                const wrappedActionName = event.payload.wrapped_action_name;
                if (wrappedActionName == 'REFERENCE_INFO_CLICK') {
                    if (event.payload.wrapped_payload &&
                        event.payload.wrapped_payload.referenceInfoClick &&
                        event.payload.wrapped_payload.referenceInfoClick.referencetable &&
                        event.payload.wrapped_payload.referenceInfoClick.sys_id
                    )
                        navigateToForm(event.payload.wrapped_payload.referenceInfoClick.referencetable, event.payload.wrapped_payload.referenceInfoClick.sys_id, {});
                }
                break;
            case 'SN_FORM_DATA_CONNECTED#FETCH_SUCCESS':
                const formData = event.payload.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query.formLayout;
                if(!formData.sysId){
                    //deleted record fetch -> re-direct to list page
                    navigateToList(formData.table);
                    return;
                }
                const colorFields = {},
                    webClientProps = {};
                formData.recordValues.forEach(_field => {
                    colorFields[_field.name] = _field;
                    webClientProps[_field.name] = _field.displayValue;
                });
                const {
                    brandingSettingsInitialValue: initialValue
                } = api.state || {};
                const brandingSettingsFields = ['type_presence_delay', 'msg_delay', 'va_logo', 'menu_title', 'header_label', 'va_profile', 'branding_name'];
                brandingSettingsFields.forEach(function(dataItem) {
                    if (Object.keys(initialValue).length != 0 && (webClientProps[dataItem] != initialValue[dataItem])) {
                        trackUsage('CI - Frequently modified fields - Branding', {
                            fields: dataItem,
                            timestamp: new Date()
                        });
                    }
                });
                api.setState('brandingSettingsInitialValue', webClientProps);
                api.setState('colorFields', colorFields);

                // Set values for header and body font dropdowns
                const HEADER_FONT_SOURCE_COLUMN_KEY = 'header_font_src';
                const BODY_FONT_SOURCE_COLUMN_KEY = 'body_font_src';
                const HEADER_URL_FONT_NAME_COLUMN_KEY = 'header_font_name';
                const BODY_URL_FONT_NAME_COLUMN_KEY = 'body_font_name';

                const headerFontRecordObj = formData.recordValues.find(record => record.name === HEADER_FONT_SOURCE_COLUMN_KEY);
                const bodyFontRecordObj = formData.recordValues.find(record => record.name === BODY_FONT_SOURCE_COLUMN_KEY);
                const headerFont = headerFontRecordObj && headerFontRecordObj.value;
                const bodyFont = bodyFontRecordObj && bodyFontRecordObj.value;
                let urlBasedFontData = { ...api.state.urlBasedFontData};

                /**
                 * Update web client properties to pick up the font family source.
                 * If the font source value is not a theme asset URI then consider it to be external URL.
                 * Validate if font name is present and update the state variable with the URL based info.
                 */
                const handleFontValuePopulation = (fontSrc, fontSrcColumnKey, fontNameColumnKey) => {
                    const fontName = formData.recordValues.find(record => record.name === fontNameColumnKey).value;
                    if (fontSrc && !isValidThemeAssetAddress(fontSrc) && fontName) {
                        urlBasedFontData[fontSrcColumnKey] = fontSrc;
                        urlBasedFontData[fontNameColumnKey] = fontName;
                    }
                    webClientProps[fontSrcColumnKey] = fontSrc;
                };

                /**
                 * Update web client properties to pick up the font size change.
                 */
                let elementsData = formData.elementsData;
                let headerFontSizesArray = extractChatFontSizes('chat_header_font_size');
                setFontSizeState(headerFontSizesArray, 'headerFontSizeList', 'selectedHeaderFontSize',  'chat_header_font_size');
                let bodyFontSizesArray = extractChatFontSizes('chat_body_font_size');
                setFontSizeState(bodyFontSizesArray, 'bodyFontSizeList', 'selectedBodyFontSize',  'chat_body_font_size');
                
                function setFontSizeState(fontSizesArray, fontSizeListStateName, selectedFontSizeStateName, fontSizeColumnName) {
                    if (fontSizesArray && fontSizesArray.choices) {
                        const transformedChoices = fontSizesArray.choices.reduce((result, curr) => {
                            if (curr.hasOwnProperty("displayValue")) {
                                result.push({
                                    label: curr.displayValue,
                                    id: parseFloat(curr.value)
                                })
                            }
                            return result;
                            },
                        []);
                        api.setState(fontSizeListStateName, transformedChoices);
                        let selectedFontSize = findElement(formData.recordValues, fontSizeColumnName);
                        api.setState(selectedFontSizeStateName, selectedFontSize ? [parseFloat(selectedFontSize)] : [1]);
                        const fontPropName = fontSizeColumnName+'_multiplier';
                        webClientProps[fontPropName] = selectedFontSize ? parseFloat(selectedFontSize): 1;
                        updateWebclientSettings(webClientProps);
                    }
                }

                function findElement(recordValues, field) {
                    let sizeObj = recordValues.find((element) => {
                        return element['name'] === field;
                    });
                    if (sizeObj == undefined) return null;
                    return sizeObj.value;
                }

                function extractChatFontSizes(field) {
                    let element = elementsData.find((element) => {
                        return element['name'] === field;
                    });
                    if (element == undefined) return null;
                    return element;
                }

                handleFontValuePopulation(headerFont, HEADER_FONT_SOURCE_COLUMN_KEY, HEADER_URL_FONT_NAME_COLUMN_KEY);
                handleFontValuePopulation(bodyFont, BODY_FONT_SOURCE_COLUMN_KEY, BODY_URL_FONT_NAME_COLUMN_KEY);
                api.setState('selectedHeaderFont', [headerFont]);
                api.setState('selectedBodyFont', [bodyFont]);
                api.setState('urlBasedFontData', { ...urlBasedFontData });

                //update onload webclient props to comply colors
                updateWebclientSettings(webClientProps);
                break;
                //any field changed in gform
            case 'SN_FORM_DATA_CONNECTED#FIELD_VALUE_CHANGED':
                const {
                    fieldName,
                    displayValue,
                    value
                } = event.payload;
                const updatedField = {};
                if(fieldName === 'chat_header_font_size' || fieldName === 'chat_body_font_size')
                    updatedField[fieldName] = value;
                else
                    updatedField[fieldName] = displayValue;

                updateWebclientSettings(updatedField);
                break;
        }
    } catch (e) {
        api.setState('hideRecordNotFound', false);
        api.setState('isValidRecord', false);
        api.setState('isRecordEditable', false);
    }
    api.setState('contentLoaded', true);
}
