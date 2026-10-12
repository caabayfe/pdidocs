/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const nacmPayload = {...(api.state.nacmPayload || {})};
    if (event.elementId === 'enhanced_content_editor_1' && nacmPayload.initialized && !api.state.isOpenPromptAvailable)
        return;

    const payload = event.payload;

    const LANGUAGE_LABEL = await helpers.translate("Language");
    const SOURCE_LABEL = await helpers.translate("Source");
    const STYLE_GUIDE_LABEL = await helpers.translate("Style guide");
    const NONE_LABEL = await helpers.translate("--None--");

    switch (event.name) {
        case 'SN_NACM#MENU_ACTION_CLICKED':
            api.setState('isOpenPromptLoading', true);
            const nacmPageConfig = {...(api.state.nacmPageConfig || {})};
            nacmPageConfig.recommendationDialogProperties = nacmPageConfig.recommendationDialogProperties || {};
            nacmPageConfig.recommendationDialogProperties.closeButtonTooltip = await helpers.translate('Cancel request');
            api.setState('nacmPageConfig', nacmPageConfig);
            break;
        case 'MACROPONENT_READY':
            nacmPayload['template'] = api.context.props.table;
            const initNacmPageConfig = {...(api.state.nacmPageConfig || {})};
            initNacmPageConfig.recommendationDialogProperties = initNacmPageConfig.recommendationDialogProperties || {};
            initNacmPageConfig.recommendationDialogProperties.headerLoadingLabel = await helpers.translate('Working on your request...');
            api.setState('nacmPageConfig', initNacmPageConfig);
            api.setState('nacmBlockTriggerProps', {tooltipContent: await helpers.translate('Make changes using AI')});
            break;
        case 'CTRL_RECORD#RECORD_DATA_FETCH_COMPLETED':
            // For new (empty) articles, initialize the open prompt immediately so it shows
            // as the full-screen canvas experience.
            if (api.data.record?.isNew) {
                initializeOpenPrompt();
            }
            break;
        case 'SN_ENHANCED_CONTENT_EDITOR#CONTENT_READY':
            // Init Open Prompt for existing/checked-out articles
            if (!nacmPayload.initialized && !nacmPayload.formFields) {
                initializeOpenPrompt();
            }
            break;
        case 'CTRL_RECORD#FIELD_VALUE_CHANGED':
            if (nacmPayload.formFields) {
                const field = nacmPayload.formFields[payload.fieldName];
                updateOpenPromptField(field, payload);
            } else {
                initializeOpenPrompt();
            }
            if (payload.fieldName === "kb_knowledge_base") {
                if (nacmPayload.kbase2LangsMap[payload.value]) {
                    nacmPayload.availableLanguages = nacmPayload.kbase2LangsMap[payload.value].map(({
                        code,
                        label
                    }) => ({
                        id: code,
                        label
                    }));
                } else {
                    nacmPayload.availableLanguages = [{
                        id: 'en',
                        label: 'English'
                    }];
                }
                nacmPayload.availableStyleGuides = [{ id: '', label: NONE_LABEL }];
                nacmPayload.styleGuide = '';
                initializeOpenPrompt();
            } else if (payload.fieldName === 'language') {
                let languageMatched = false;
                for (const {
                        id
                    } of nacmPayload.availableLanguages) {
                    if (id === payload.value) {
                        languageMatched = true;
                        break;
                    }
                }
                nacmPayload.language = languageMatched ? payload.value : 'en';
            }
            updateBlockOpenPromptConfig();
            break;
        case 'SN_NACM#SLOT_DROPDOWN_SELECTED_ITEMS_SET':
            nacmPayload[payload.name] = payload.value[0];
            if (payload.name === 'language')
                api.emit('GEN_AI_SET_FIELD', {
                    fieldName: 'language',
                    value: payload.value[0]
                });
            break;
        case 'DATA_FETCH_FAILED':
            if (event.elementId === 'initialize_km_open_prompt_1') {
                nacmPayload.initialized = true;
                console.error('Knowledge Gen AI Open Prompt Error: Unable to initialize.');
            }
            break;
        case 'DATA_FETCH_SUCCEEDED':
            const output = api.data[event.elementId].output;
            if (event.elementId === 'initialize_km_open_prompt_1') {
                nacmPayload.initialized = true;
                if (!output.success) {
                    console.log('Knowledge Gen AI Open Prompt: ' + output.error);
                } else {
                    const {
                        languages = [],
                        sources = [],
                        styleGuides = [],
                        selectedStyleGuides = [],
                        selectedLanguages = [],
                        selectedSources = [],
                        prepopulatedInstruction = '',
                        adminConfigs = null,
                        languagesDetails = {},
                        maxTokensPerBlock = 10000,
                        disallowedTags = [],
                        allowedTags = []
                    } = output.data || {};

                    api.setState('nacmConfig', adminConfigs);
                    api.setState('isOpenPromptAvailable', true);
                    nacmPayload.prepopulatedInstruction = prepopulatedInstruction;
                    nacmPayload.availableSources = JSON.parse(JSON.stringify(sources));
                    nacmPayload.blockConfigs = { maxTokensPerBlock, disallowedTags, allowedTags };
                    nacmPayload.source = selectedSources[0] || '';

                    nacmPayload.availableStyleGuides = [
                        { id: '', label: NONE_LABEL },
                        ...styleGuides.map(sg => ({ id: sg.sys_id, label: sg.name }))
                    ];
                    nacmPayload.styleGuide = selectedStyleGuides[0] || '';

                    nacmPayload.kbase2LangsMap = languages;
                    nacmPayload.language = selectedLanguages[0] || '';
                    nacmPayload.languagesDetails = languagesDetails;
                    const kbase = api.data.record.form.fields.kb_knowledge_base.value;
                    const isKnowledgeBaseSelected = !!(kbase && kbase.length > 0);
                    if (isKnowledgeBaseSelected) {
                        if (languages[kbase]) {
                            nacmPayload.availableLanguages = languages[kbase].map(({
                                code,
                                label
                            }) => ({
                                id: code,
                                label
                            }));
                        } else {
                            nacmPayload.availableLanguages = [{
                                id: 'en',
                                label: 'English'
                            }];
                        }
                    } else {
                        nacmPayload.availableLanguages = [{
                            id: 'en',
                            label: 'English'
                        }];
                        // Only show the language hint when no KB has been selected yet, and exclude kb_knowledge_block where Open Prompt UI is not available
                        const currentTable = api.context.props.table;
                        const isKnowledgeBlock = currentTable === 'kb_knowledge_block';
                        if (!isKnowledgeBlock) {
                            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                                items: [{
                                    id: "openprompt_language_default",
                                    status: "info",
                                    icon: "info-circle-outline",
                                    content: await helpers.translate("Select a knowledge base for potentially more language options."),
                                    action: {
                                        type: "dismiss"
                                    }
                                }]
                            });
                        }
                    }
                }
                updateBlockOpenPromptConfig();
            }
            break;
        case 'SN_ENHANCED_CONTENT_EDITOR#COMPONENT_SELECTED':
            if (payload.isBody) return;
            // todo: reduce the scope to limited set of meta fields + template fields
            try {
                const parsedHTML = parseHTML(payload.content.html, payload.id);
                nacmPayload['selectedText'] = parsedHTML.target || parsedHTML.body;
                nacmPayload['selectedTextId'] = payload.id;
                nacmPayload['selectedSection'] = payload.section;
            } catch (e) {
                console.error('Open Prompt Error: ' + e);
            }
            if (nacmPayload.selectedTextId && nacmPayload.selectedText) {
                const html = nacmPayload.selectedText.html;
                api.setState('isOpenPromptSupportedContent', validateOpenPromptSupportedContent(html, nacmPayload.blockConfigs));
            }
            break;
        case 'SN_ENHANCED_CONTENT_EDITOR#COMPONENT_DESELECTED':
            api.setState('isOpenPromptSupportedContent', false);
            if (payload.id == nacmPayload.selectedTextId) {
                nacmPayload['selectedText'] = {};
                nacmPayload['selectedTextId'] = null;
                nacmPayload['selectedSection'] = null;
            }
            break;
        case 'SN_ENHANCED_CONTENT_EDITOR#CONTENT_UPDATED':
            try {
                nacmPayload['ece'] = {};
                for (const field of payload.content) {
                    const parsedHTML = parseHTML(field.value, nacmPayload.selectedTextId);
                    nacmPayload['ece'][field.id] = parsedHTML.body;
                    if (parsedHTML.target) {
                        nacmPayload.selectedText = parsedHTML.target;
                    }
                }
            } catch (e) {
                console.error('Open Prompt Error: ' + e);
            }
            break;
        case 'SN_NACM#FEEDBACK_SUBMITTED':
            if (payload.additionalData !== "CLOSED") {
                api.setState('updateOpenPromptPayload', {
                    contextId: api.state.currentOpenPromptTransaction,
                    operation: 'feedback',
                    args: {
                        value: (payload.feedback === 'Accepted') ? 1 : 0
                    }
                });
            }
            break;
        case 'SN_NACM#RECOMMENDATION_DIALOG_CLOSED':
            if (api.state.isOpenPromptLoading) {
                // payload.state == "LOADING" (as opposed to "LOADED")
                api.setState('isOpenPromptLoading', false);
                api.setState('updateOpenPromptPayload', {
                    contextId: api.state.currentOpenPromptTransaction,
                    operation: 'terminate',
                    args: {}
                });
            }
            break;
    }

    function initializeOpenPrompt() {
        const openPromptFields = {};
        const fields = api.data.record?.form?.fields || {};
        for (const key in fields) {
            const field = fields[key];
            const fieldType = field.dictionary ? field.dictionary.type : field.type;
            openPromptFields[key] = {
                type: (fieldType === 'html' || fieldType === 'translated_html') ? 'html' : fieldType
            };
            updateOpenPromptField(openPromptFields[key], field);
        }
        nacmPayload['formFields'] = openPromptFields;
        api.data.initialize_km_open_prompt_1.refresh();
    }

    function updateOpenPromptField(field, formField) {
        if (api.state.nacmPayload.initialized && !api.state.isOpenPromptAvailable)
            return;
        field.value = formField.value;
        field.displayValue = formField.displayValue;
        field.html = formField.value;
        field.text = formField.displayValue;
        switch (field.type) {
            case 'html':
                const {
                    body: {
                        html,
                        text
                    }
                } = parseHTML(field.value);
                field.text = text;
                field.html = html;
                break;
            case 'choice':
                field.choices = formField.choices;
                break;
        }
    }

    function parseHTML(s, targetId) {
        let html, text;
        let parsedTarget = null;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(s, 'text/html');
            if (doc.body) {
                html = doc.body.innerHTML;
                text = doc.body.innerText;
            } else {
                html = doc.outerHTML;
                text = doc.outerText;
            }
            if (targetId) {
                const target = doc.querySelector(`#${targetId}`);
                if (target) {
                    parsedTarget = {
                        text: target.outerText,
                        html: target.outerHTML
                    };
                }
            }
        } catch (e) {
            console.error('KM Open Prompt Error: ' + e);
        }
        return {
            body: {
                html,
                text
            },
            target: parsedTarget
        };
    }

    function updateBlockOpenPromptConfig() {
        let openPromptFooterLeftSlotConfig = [{
                "name": "source-dropdown",
                "type": "now-dropdown",
                "values": {
                    "name": "source",
                    "bare": true,
                    "items": nacmPayload.availableSources,
                    "selectedItems": [nacmPayload.source],
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
                    "items": nacmPayload.availableLanguages,
                    "selectedItems": [nacmPayload.language],
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
        ];
        if (nacmPayload.availableStyleGuides?.length > 1) {
            openPromptFooterLeftSlotConfig.push({
                "name": "style-guide-dropdown",
                "type": "now-dropdown",
                "values": {
                    "name": "styleGuide",
                    "bare": true,
                    "items": nacmPayload.availableStyleGuides,
                    "selectedItems": [nacmPayload.styleGuide],
                    "label": STYLE_GUIDE_LABEL,
                    "labelPosition": "start",
                    "select": "single",
                    "size": "sm",
                    "style": { "paddingRight": "8px" },
                    "variant": "tertiary",
                    "disabled": true
                }
            });
        }
        api.setState('nacmBlockOpenPromptConfig', {
            "openPromptFooterLeftSlotConfig": openPromptFooterLeftSlotConfig
        });
    }

    function validateOpenPromptSupportedContent(html, configs) {
        const { maxTokensPerBlock, allowedTags, disallowedTags } = configs;

        if (!html) {
            return false;
        }

        // heuristic estimation: 1 token =~ 4 chars.
        const estimatedTokens = Math.ceil(html.normalize("NFC").trim().length / 4);
        if (estimatedTokens > maxTokensPerBlock) {
            return false;
        }

        const startsWithAllowedTagRegex = new RegExp(`^\\s*<\\s*(${allowedTags.join('|')})\\b`, 'i');
        if (!startsWithAllowedTagRegex.test(html)) {
            return false;
        }

        const disallowedTagsRegex = new RegExp(`<\\s*(${disallowedTags.join('|')})\\b[^>]*\\/?\\s*>`, 'i');
        if (disallowedTagsRegex.test(html)) {
            return false;
        }

        // Read-only blocks are not supported, so return false if class ece-read-only-block is found
        const readOnlyBlockRegex = new RegExp(
            `<\\s*div\\b[^>]*\\bclass\\s*=\\s*["'][^"']*\\bece-read-only-block\\b[^"']*["'][^>]*>`,
            'i'
        );
        if (readOnlyBlockRegex.test(html)) {
            return false;
        }

        return true;
    }

    api.setState('nacmPayload', nacmPayload);
}
