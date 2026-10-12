/**
 * TinyMCE Toolbar Config Client Script for Knowledge Articles
 *
 * This script configures the TinyMCE toolbar and plugin options based on
 * system properties and dictionary attributes. It is triggered when the
 * KM-owned sys properties data broker (fetch_km_editor_properties_1) succeeds —
 * splitting this out of the HTML Fields Config script eliminates a race
 * condition where tinymceToolbarConfig was set before sys props had resolved.
 *
 * Ref https://code.devsnc.com/dev/controls-monorepo/blob/master/packages/glide-form-controls/src/base/controlElementFactory.js
 * Ref https://code.devsnc.com/dev/controls-monorepo/blob/master/packages/html-editor/src/Utils.js
 */
function handler({
    api,
    event,
    imports
}) {
    const editorUtil = imports["sn_km_center.EnhancedEditorUtils"](api);

    // Extract dictionary attributes from the first HTML/translated_html field on
    // the form. Use the first match (not the last) so the toolbar config is
    // deterministic on multi-HTML-field forms — for...in order is not guaranteed.
    let dictionaryAttributes = [];
    const fieldsMap = api.data.record?.form?.fields || {};
    for (const fieldName in fieldsMap) {
        const fieldData = fieldsMap[fieldName];
        const fieldType = fieldData.dictionary ? fieldData.dictionary.type : fieldData.type;
        if (fieldType === 'html' || fieldType === 'translated_html') {
            dictionaryAttributes = fieldData.dictionary ? fieldData.dictionary.attributes : [];
            break;
        }
    }

    // 1. SYS Props - Fetch system properties for TinyMCE configuration
    let tinymceSysProps = {};

    if (api.data.fetch_km_editor_properties_1 &&
        api.data.fetch_km_editor_properties_1.output &&
        api.data.fetch_km_editor_properties_1.output.properties) {
        tinymceSysProps = api.data.fetch_km_editor_properties_1.output.properties;
    }

    const {
        "glide.ui.html.editor.toolbar": toolbarProp = "",
        "glide.ui.html.editor.valid_plugins": validPluginsProp = "",
        "glide.ui.html.editor.enabled_plugins": pluginsProp = "",
        "glide.ui.html.editor.toolbar.valid_buttons": validButtonsProp = ""
    } = tinymceSysProps;

    // 2. Dictionary Attributes - Extract toolbar and plugins values from dictionary attributes
    const toolbarAttr = dictionaryAttributes.find(attr => attr.name === "editor.toolbar")?.value || "";
    const pluginsAttr = dictionaryAttributes.find(attr => attr.name === "editor.plugins")?.value || "";

    // 3. Merge based on precedence
    // Dictionary Attributes takes preference over sys props
    const toolbar = toolbarAttr || toolbarProp;
    const plugins = pluginsAttr || pluginsProp;

    // 4. Filter further based on valid buttons and plugins from sys props
    const tinymceToolbarConfig = editorUtil.getTinyMCEToolbar(toolbar,
        plugins,
        validButtonsProp,
        validPluginsProp);

    // Set the TinyMCE toolbar configuration in state
    api.setState('tinymceToolbarConfig', tinymceToolbarConfig);

}
