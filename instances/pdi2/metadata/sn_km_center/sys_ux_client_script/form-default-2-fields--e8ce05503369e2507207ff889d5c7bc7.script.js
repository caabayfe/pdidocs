/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 * @returns {Object} Filtered fields object containing only html/translated_html fields
 *
 * This script is only in the scope of "Knowledge Record with ECE" and displays only for 
 * readonly articles. So, no conflict with the other routes with TinyMCE.
 *
 * Client transform for Form Default 2 (right slot) on the KB article page.
 * Filters fields to only html/translated_html types and enables TinyMCE
 * autoresize so editors fit their content instead of using a fixed height.
 *
 * Note : Knowledge > Article Body (text) Field has OOB editor height as 300 
 * set in the dictionary attribute and no height set on template HTML fields
 *
 */
function evaluateProperty({
    api,
    helpers
}) {
    // Editor height constants (in pixels)
    const MAX_HEIGHT_SINGLE_FIELD = 600; // For single field
    const MAX_HEIGHT_MULTI_FIELD = 300;  // For multiple fields

    const fieldsMap = api.data.record?.form?.fields ?? {};

    // Filter to only html/translated_html fields
    const filteredFields = {};
    for (const [fieldName, fieldData] of Object.entries(fieldsMap)) {
        if (!fieldData) continue;

        const fieldType = fieldData.dictionary?.type ?? fieldData.type;
        if (fieldType === 'html' || fieldType === 'translated_html' || fieldType === 'wiki_text' || fieldType === 'markdown') {
            filteredFields[fieldName] = fieldData;
        }
    }

    // Get total HTML Fields 
    const fieldCount = Object.keys(filteredFields).length;
    if (fieldCount === 0) return filteredFields;

    // Determine max height: single field gets more space (600px), multiple fields share space (300px)
    const maxHeight = fieldCount === 1 ? MAX_HEIGHT_SINGLE_FIELD : MAX_HEIGHT_MULTI_FIELD;

    // Helper to set or update dictionary attributes
    const setAttr = (attrs, name, value) => {
        const existing = attrs.find(a => a.name === name);
        if (existing) {
            existing.value = String(value);
        } else {
            attrs.push({ name, value: String(value) });
        }
    };

    // Configure autoresize for each field
    for (const [fieldName, fieldData] of Object.entries(filteredFields)) {
        // Ensure dictionary and attributes exist (template fields may not have these)
        if (!fieldData.dictionary) {
            fieldData.dictionary = {};
        }
        const dict = fieldData.dictionary;

        if (!Array.isArray(dict.attributes)) {
            dict.attributes = [];
        }
        const attrs = dict.attributes;

        // Add autoresize plugin to TinyMCE
        // If no plugins exist, add minimal set: readonlynoborder + autoresize
        let pluginsAttr = attrs.find(a => a.name === 'editor.plugins');
        if (!pluginsAttr) {
            pluginsAttr = {
                name: 'editor.plugins',
                value: 'readonlynoborder autoresize'
            };
            attrs.push(pluginsAttr);
        } else if (pluginsAttr.value && !pluginsAttr.value.split(/\s+/).includes('autoresize')) {
            pluginsAttr.value = pluginsAttr.value.trim() + ' autoresize';
        }

        // Remove fixed height to allow autoresize to work
        const heightIdx = attrs.findIndex(a => a.name === 'editor.height');
        if (heightIdx > -1) {
            attrs.splice(heightIdx, 1);
        }

        // Set autoresize bounds: min 300px, grows with content up to max
        setAttr(attrs, 'editor.min_height', MAX_HEIGHT_MULTI_FIELD);
        setAttr(attrs, 'editor.max_height', maxHeight);
    }

    return filteredFields;
}
