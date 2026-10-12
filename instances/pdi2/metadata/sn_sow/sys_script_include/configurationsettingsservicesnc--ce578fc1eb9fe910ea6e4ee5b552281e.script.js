var ConfigurationSettingsServiceSNC = Class.create();
ConfigurationSettingsServiceSNC.Constants = {
    EMPTY_STRING: "",
    PROCESSING_NODE_KEY: '$$',
    RUNTIME_FUNCTION_GETMESSAGE: 'getMessage',
    TABLE_CATEGORY: 'sn_sow_cfg_cat',
    TABLE_GROUP: 'sn_sow_cfg_grp',
    TABLE_SETTING: 'sn_sow_cfg_stg',
    TYPE_CONDITION: 'condition',
    TYPE_CONSTANT: 'constant',
    TYPE_FIELD_NAME: 'field_name',
    TYPE_FIELD_LIST: 'field_list',
    TYPE_JSON: 'json',
    TYPE_OBJECT: 'object',
    TYPE_PAR_VISUALIZATION: 'par_visualization',
    TYPE_REFERENCE: 'reference',
    TYPE_SIMPLE_NAME_VALUES: 'simple_name_values',
    TYPE_STRING: 'string',
    TYPE_TRANSLATED_TEXT: 'translated_text',
    FIELD_CATEGORY: 'category',
    FIELD_CONDITIONS: 'conditions',
    FIELD_FIELD_NAME: 'field_name',
    FIELD_FIELD_LIST: 'field_list',
    FIELD_GROUP: 'group',
    FIELD_KEY: 'key',
    FIELD_ORDER: 'order',
    FIELD_PARENT: 'parent',
    FIELD_REF_DOC: 'ref_doc',
    FIELD_REF_ID: 'ref_id',
    FIELD_REF_TABLE: 'ref_table',
    FIELD_SIMPLE_NAME_VALUES: 'simple_name_values',
    FIELD_TYPE: 'type',
    FIELD_VALUE: 'value'
};
ConfigurationSettingsServiceSNC.prototype = {
    type: 'ConfigurationSettingsServiceSNC',
    initialize: function() {},
    cloneDeep: function(node) {
        if (!node) {
            return node;
        }
        var copy = node;
        if (typeof node == ConfigurationSettingsServiceSNC.Constants.TYPE_OBJECT) {
            copy = {};
            for (var k in node) {
                copy[k] = this.cloneDeep(node[k]);
            }
            // Instrument
            var type = node.type;
            if (type) {
                copy.getValue = function(ctx) {
                    if (ctx) {
                        if (ctx.type == ConfigurationSettingsServiceSNC.Constants.TYPE_TRANSLATED_TEXT) {
                            var label = new GlideRecordSecure(ConfigurationSettingsServiceSNC.Constants.TABLE_SETTING);
                            if (label.get(ctx.sys_id + ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING)) {
                                return label.getDisplayValue(ConfigurationSettingsServiceSNC.Constants.TYPE_TRANSLATED_TEXT) + ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING;
                            }
                            return ctx.value;
                        } else if (ctx.type == ConfigurationSettingsServiceSNC.Constants.TYPE_REFERENCE) {
                            // DO NOT use anything other than GlideRecordSecure or any other workaround mechanisms
                            if (ctx && ctx.sys_id) {
                                var grs = new GlideRecordSecure(ctx.table + ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING);
                                if (grs.get(ctx.sys_id + ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING)) {
                                    return grs;
                                }
                            }
                            return null;
                        }
                    }
                };
            }
        } else if (typeof node == ConfigurationSettingsServiceSNC.Constants.TYPE_STRING) {
            copy = node + ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING;
        }
        // TODO: Handle other types
        return copy;
    },

    // This function is likely leftover from an earlier iteration and not being used anymore. Removing the statements that violated l10n for now
    resolveJsonMacros: function(ctx, input, variables) {
        return input;
    },
    replaceStringMacros: function(ctx, input, variables) {
        var output = input;
        for (var k in variables) {
            var replacementValue = variables[k];
            var macroRegex = new RegExp('\\$\\{' + k + '\\}', 'g');
            output = output.replace(macroRegex, replacementValue);
        }
        return output;
    },
    getRootConfigurations: function(ctx, categorySysId, subCategorySysId, encodedQuery) {
        if (!categorySysId && !subCategorySysId && !encodedQuery) {
            throw gs.getMessage("At least category, group or filter MUST be passed in");
        }
        var cacheKey = categorySysId + ":" + subCategorySysId + ":" + encodedQuery;
        var cachedValue = sn_scoped_cache.ScopedCacheManager.get(ConfigurationSettingsServiceSNC.Constants.TABLE_SETTING, cacheKey);
        var rootNodes = {};

        // treat empty object as ivalid configuration to recover from bad cache records (DEF0550363) 
        if (cachedValue && cachedValue !== '{}') {
            rootNodes = JSON.parse(cachedValue);
        } else {
            var gr = new GlideRecordSecure(ConfigurationSettingsServiceSNC.Constants.TABLE_SETTING);
            if (categorySysId) {
                gr.addQuery(ConfigurationSettingsServiceSNC.Constants.FIELD_GROUP + '.' + ConfigurationSettingsServiceSNC.Constants.FIELD_CATEGORY, categorySysId);
            }
            if (subCategorySysId) {
                gr.addQuery(ConfigurationSettingsServiceSNC.Constants.FIELD_GROUP, subCategorySysId);
            }
            if (encodedQuery) {
                gr.addEncodedQuery(encodedQuery, false);
            }
            // Doing this will ensure nodes are added in correct order 
            gr.orderBy(ConfigurationSettingsServiceSNC.Constants.FIELD_ORDER);
            gr.query();
            var nodes = {};
            while (gr.next()) {
                var sysId = gr.getUniqueValue();
                var parentSysId = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_PARENT);
                var key = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_KEY);
                var type = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_TYPE);
                // Could process child nodes before parent so add node to map and re-use from map
                if (!nodes[sysId]) {
                    nodes[sysId] = {
                        childNodes: {}
                    };
                }
                var node = nodes[sysId];
                // Now check if it is a root node if so add to root node map
                if (!parentSysId) {
                    rootNodes[key] = node;
                } else {
                    // If parent node does not exist put a placeholder in
                    if (!nodes[parentSysId]) {
                        nodes[parentSysId] = {
                            childNodes: {}
                        };
                    }
                    nodes[parentSysId].childNodes[key] = node;
                }
                // Fill in details of node
                node.type = type;
                node.key = key;
                node.sys_id = sysId;
                if (type == ConfigurationSettingsServiceSNC.Constants.TYPE_TRANSLATED_TEXT) {
                    node.value = gr.getValue(ConfigurationSettingsServiceSNC.Constants.TYPE_TRANSLATED_TEXT) || ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING;
                } else if (type == ConfigurationSettingsServiceSNC.Constants.TYPE_CONSTANT) {
                    node.value = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_VALUE) || ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING;
                } else if (type == ConfigurationSettingsServiceSNC.Constants.TYPE_JSON) {
                    var value = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_VALUE) || ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING;
                    node.value = null;
                    if (value) {
                        try {
                            node.value = JSON.parse(value);
                        } catch (e) {
                            gs.error("Error: sys_id=" + sysId + ", value=" + value, e);
                        }
                    }
                } else if (type == ConfigurationSettingsServiceSNC.Constants.TYPE_CONDITION || type == ConfigurationSettingsServiceSNC.Constants.TYPE_REFERENCE || type == ConfigurationSettingsServiceSNC.Constants.TYPE_FIELD_NAME || type == ConfigurationSettingsServiceSNC.Constants.TYPE_FIELD_LIST) {
                    var table = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_REF_TABLE);
                    var tableValue = {
                        table: table ? table + ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING : null
                    };
                    node.value = tableValue;
                    if (type == ConfigurationSettingsServiceSNC.Constants.TYPE_CONDITION) {
                        tableValue.conditions = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_CONDITIONS) || ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING;
                    } else if (type == ConfigurationSettingsServiceSNC.Constants.TYPE_REFERENCE) {
                        tableValue.sys_id = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_REF_ID) || ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING;
                    } else if (type == ConfigurationSettingsServiceSNC.Constants.TYPE_FIELD_NAME) {
                        tableValue.field_name = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_FIELD_NAME) || ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING;
                    } else if (type == ConfigurationSettingsServiceSNC.Constants.TYPE_FIELD_LIST) {
                        tableValue.field_list = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_FIELD_LIST) || ConfigurationSettingsServiceSNC.Constants.EMPTY_STRING;
                    }
                } else if (type == ConfigurationSettingsServiceSNC.Constants.TYPE_PAR_VISUALIZATION) {
                    node.value = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_REF_DOC);
                } else if (type == ConfigurationSettingsServiceSNC.Constants.TYPE_SIMPLE_NAME_VALUES) {
                    var jsonValueString = gr.getValue(ConfigurationSettingsServiceSNC.Constants.FIELD_SIMPLE_NAME_VALUES);
                    try {
                        node.value = JSON.parse(jsonValueString);
                    } catch (e) {
                        gs.error("Error parsing json: " + sysId);
                    }
                }
            }
            // only store valid config object
            if (Object.keys(rootNodes).length > 0)
                sn_scoped_cache.ScopedCacheManager.put(ConfigurationSettingsServiceSNC.Constants.TABLE_SETTING, cacheKey, JSON.stringify(rootNodes));
        }
        return this.cloneDeep(rootNodes);
    }
};
