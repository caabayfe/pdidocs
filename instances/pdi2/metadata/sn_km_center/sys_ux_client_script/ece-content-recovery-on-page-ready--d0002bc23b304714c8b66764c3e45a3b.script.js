/**
 * ECE Content Recovery on Page Ready
 *
 * Fires on MACROPONENT_READY — covers two failure paths:
 *
 * PATH A — Cached page load (CTRL_RECORD#RECORD_DATA_FETCH_COMPLETED never fires):
 *   ServiceNow's UXF data broker can serve record data from cache without emitting
 *   RECORD_DATA_FETCH_COMPLETED. In that case "Enhanced Editor - HTML Fields Config"
 *   never runs, eceHTMLFields is never set, and ECE shows an empty canvas.
 *   Fix: rebuild eceHTMLFields from api.data.record.form.fields on MACROPONENT_READY,
 *   using the same logic as "Enhanced Editor - HTML Fields Config".
 *
 * PATH B — Race condition (RECORD_DATA_FETCH_COMPLETED fired but ECE subscription miss):
 *   The data fetch event fires before ECE has mounted and subscribed to state.
 *   eceHTMLFields is set with content but ECE misses the notification.
 *   Fix: detect the mismatch and re-fire setState so ECE receives the value.
 */
function handler({ api, event, helpers, imports }) {

    /**
     * Extracts HTML/translated_html fields from the data broker form fields map,
     * applying the same table-filtering rules as "Enhanced Editor - HTML Fields Config".
     */
    function buildHtmlFields(fields, tbl) {
        var result = [];
        var dictionaryAttributes = [];
        var dictCaptured = false;
        for (var fieldName in fields) {
            var fieldData = fields[fieldName];
            var fieldType = fieldData.dictionary ? fieldData.dictionary.type : fieldData.type;
            if (fieldType === 'html' || fieldType === 'translated_html') {
                result.push({
                    id: fieldData.name,
                    label: fieldData.dictionary ? fieldData.dictionary.label : null,
                    value: fieldData.value || null,
                    isMandatory: fieldData.mandatory || false
                });
                // Use dictionary attributes from the first HTML field only (toolbar is a single global config)
                if (!dictCaptured) {
                    dictionaryAttributes = fieldData.dictionary ? fieldData.dictionary.attributes : [];
                    dictCaptured = true;
                }
            }
        }
        // Match table-specific filtering from "Enhanced Editor - HTML Fields Config"
        if (tbl !== 'kb_knowledge' && tbl !== 'kb_knowledge_block') {
            result = result.filter(function(f) { return f.id !== 'text'; });
        }
        return { fields: result, dictionaryAttributes: dictionaryAttributes };
    }

    /** Commits a resolved HTML fields array and TinyMCE toolbar config into the macroponent state. */
    function applyHtmlFields(htmlFields, fields, dictionaryAttributes) {
        api.setState('enableContentUpdates', true);
        api.setState('isWikiArticle', !!(fields.wiki && fields.wiki.visible));
        api.setState('isMarkdown', !!(fields.markdown && fields.markdown.visible));
        api.setState('articleType', fields.article_type?.value || 'text');
        api.setState('articleFields', htmlFields.map(function(f) { return { id: f.id, label: f.label }; }));
        api.setState('eceHTMLFields', htmlFields);

        // TinyMCE toolbar config — mirrors "Enhanced Editor - TinyMCE Toolbar Config" logic.
        // fetch_km_editor_properties_1 is EAGER so it is always populated
        // by the time MACROPONENT_READY fires, on both cached and hard-reload paths.
        var editorUtil = imports['sn_km_center.EnhancedEditorUtils'](api);
        var tinymceSysProps = {};
        if (api.data.fetch_km_editor_properties_1 &&
                api.data.fetch_km_editor_properties_1.output &&
                api.data.fetch_km_editor_properties_1.output.properties) {
            tinymceSysProps = api.data.fetch_km_editor_properties_1.output.properties;
        }
        var toolbarProp = tinymceSysProps['glide.ui.html.editor.toolbar'] || '';
        var validPluginsProp = tinymceSysProps['glide.ui.html.editor.valid_plugins'] || '';
        var pluginsProp = tinymceSysProps['glide.ui.html.editor.enabled_plugins'] || '';
        var validButtonsProp = tinymceSysProps['glide.ui.html.editor.toolbar.valid_buttons'] || '';

        var attrs = dictionaryAttributes || [];
        var toolbarAttr = '';
        var pluginsAttr = '';
        for (var i = 0; i < attrs.length; i++) {
            if (attrs[i].name === 'editor.toolbar') { toolbarAttr = attrs[i].value || ''; }
            if (attrs[i].name === 'editor.plugins') { pluginsAttr = attrs[i].value || ''; }
        }

        var tinymceToolbarConfig = editorUtil.getTinyMCEToolbar(
            toolbarAttr || toolbarProp,
            pluginsAttr || pluginsProp,
            validButtonsProp,
            validPluginsProp
        );
        api.setState('tinymceToolbarConfig', tinymceToolbarConfig);
    }

    try {
        var stateFields = api.state.eceHTMLFields || [];
        var formFields = api.data.record && api.data.record.form ? api.data.record.form.fields || {} : {};
        var table = api.data.record ? api.data.record.table : null;

        // PATH A: eceHTMLFields is empty — RECORD_DATA_FETCH_COMPLETED was skipped (cached load).
        // Build eceHTMLFields here, replicating "Enhanced Editor - HTML Fields Config" logic.
        if (stateFields.length === 0) {
            var built = buildHtmlFields(formFields, table);
            var htmlFields = built.fields;

            if (htmlFields.length > 0) {
                // Cached load — data was immediately available. Set eceHTMLFields now.
                applyHtmlFields(htmlFields, formFields, built.dictionaryAttributes);
                console.debug('ECE Content Recovery: rebuilt ' + htmlFields.length + ' fields (cached load)');
            } else {
                // Hard reload — MACROPONENT_READY fires before the data broker network fetch
                // completes. Schedule a single one-time retry after 700 ms (covers P95 broker
                // round-trip latency on the UXF data broker; this branch is never reached on
                // cached loads because data is already present in the block above).
                helpers.timing.setTimeout(function() {
                    try {
                        // Guard: if "Enhanced Editor - HTML Fields Config" already ran via
                        // RECORD_DATA_FETCH_COMPLETED while we were waiting, do nothing.
                        if (api.state.eceHTMLFields && api.state.eceHTMLFields.length > 0) {
                            return;
                        }

                        var retryFormFields = api.data.record && api.data.record.form
                            ? api.data.record.form.fields || {} : {};
                        var retryTable = api.data.record ? api.data.record.table : null;
                        var retryBuilt = buildHtmlFields(retryFormFields, retryTable);
                        var retryHtmlFields = retryBuilt.fields;

                        if (retryHtmlFields.length > 0) {
                            applyHtmlFields(retryHtmlFields, retryFormFields, retryBuilt.dictionaryAttributes);
                            console.debug('ECE Content Recovery: rebuilt ' + retryHtmlFields.length + ' fields (retry)');
                        }
                    } catch (e) {
                        console.error('[KM-ECE] ECE Content Recovery retry error:', e);
                    }
                }, 700);
            }
            return;
        }

        // PATH B: eceHTMLFields exists but may contain empty values due to a subscription
        // miss — patch any field whose state value is empty but broker value is not.
        var needsUpdate = false;
        var corrected = stateFields.map(function(field) {
            var formField = formFields[field.id];
            var liveValue = formField ? formField.value : null;
            if (liveValue && !field.value) {
                needsUpdate = true;
                return Object.assign({}, field, { value: liveValue });
            }
            return field;
        });

        if (needsUpdate) {
            api.setState('eceHTMLFields', corrected);
            console.debug('ECE Content Recovery: patched ' + corrected.length + ' fields (PATH B)');
        }
    } catch (e) {
        console.error('[KM-ECE] ECE Content Recovery on Page Ready error:', e);
    }
}
