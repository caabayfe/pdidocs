var SOWEvamPostProcessor = Class.create();
/**
 * Internal Methods
 **/
SOWEvamPostProcessor._replaceMacrosString = function(input, gr) {
    var out = input;
    var macros = input.match(/\$\{.*?\}/g);
    for (var i in macros) {
        var macro = macros[i];
        var field = macro.replace('${', '').replace('}', '');
        var value = null;
        if (field.indexOf('.' > 0)) {
            var parts = field.split('.');
            var curr = gr;
            for (var pi = 0; pi < parts.length - 1; pi++) {
                curr = curr[parts[pi]];
            }
            if (curr) {
                value = curr[parts[pi]] + '';
            }
        } else {
            value = gr.getValue(field);
        }
        out = out.replace(macro, value);
    }
    return out;
};
SOWEvamPostProcessor._replaceMacrosJson = function(jsonNode, gr) {
    var isArray = Array.isArray(jsonNode);
    if (isArray) {
        for (var ai in jsonNode) {
            SOWEvamPostProcessor._replaceMacrosJson(jsonNode[ai], gr);
        }
    }
    for (var property in jsonNode) {
        var propertyValue = jsonNode[property];
        if ('object' === typeof propertyValue) {
            SOWEvamPostProcessor._replaceMacrosJson(propertyValue, gr);
        } else if ('string' === typeof propertyValue) {
            jsonNode[property] = SOWEvamPostProcessor._replaceMacrosString(propertyValue, gr);
        }
        var replacementKey = SOWEvamPostProcessor._replaceMacrosString(property, gr);
        if (replacementKey !== property) {
            jsonNode[replacementKey] = jsonNode[property];
            delete jsonNode[property];
        }
    }
};
SOWEvamPostProcessor._replaceMacros = function(input, gr) {
    if (input) {
        if ('object' === typeof input) {
            // Make copy since these are templates
            var copy = JSON.parse(JSON.stringify(input));
            // Function handling
            var isFunction = copy.hasOwnProperty('$');
            if (isFunction) {
                var newValue = null;
                if ('lookup' == copy['$']) {
                    var lookup = copy.lookup;
                    if (lookup) {
                        var key = SOWEvamPostProcessor._replaceMacrosString(copy.key, gr);
                        newValue = lookup[key];
                    }
                } else if ('sys_highlighted_value' == copy['$']) {
                    var table = SOWEvamPostProcessor._replaceMacrosString(copy.table, gr);
                    var sysId = SOWEvamPostProcessor._replaceMacrosString(copy.sysId, gr);
                    var field = copy.field;
                    if (false == gs.nil(table) && false == gs.nil(sysId) && false == gs.nil(field)) {
                        var refGr = null;
                        if (sysId == gr.getUniqueValue()) {
                            refGr = gr;
                        } else {
                            var testGr = new GlideRecordSecure(table);
                            if (testGr.get(sysId)) {
                                refGr = testGr;
                            }
                        }
                        if (refGr) {
                            var highlightGr = new GlideRecord('sys_highlighted_value_condition');
                            highlightGr.addQuery('highlighted_value.table', table);
                            highlightGr.addQuery('highlighted_value.field', field);
                            highlightGr.orderBy('order');
                            highlightGr.query();
                            while (highlightGr.next()) {
                                var conditions = highlightGr.getValue('conditions');
                                var evaluationResult = GlideFilter.checkRecord(refGr, conditions);
                                if (evaluationResult) {
                                    newValue = highlightGr.getValue('status');
                                    break;
                                }
                            }
                        }

                    }
                }
                return newValue;
            } else {
                return SOWEvamPostProcessor._replaceMacrosJson(copy, gr);
            }
        } else if ('string' === typeof input) {
            return SOWEvamPostProcessor._replaceMacrosString(input, gr);
        }
    }
    return null;
};
SOWEvamPostProcessor._replacePropValues = function(propValues, propXforms, gr) {
    if (propXforms) {
        for (var key in propXforms) {
            var propXform = propXforms[key];
            var newValue = SOWEvamPostProcessor._replaceMacros(propXform, gr);
            propValues[key] = newValue;
        }
    }
};
SOWEvamPostProcessor._replaceActions = function(existingActions, configActions, gr) {
    var newActions = existingActions ? existingActions : [];
    if (configActions) {
        for (var key in configActions) {
            var action = configActions[key];
            newActions.push(action);
        }
    }
    return newActions;
};
SOWEvamPostProcessor._enhanceActionPayloads = function(actions, gr) {
    if (actions) {
        for (var i in actions) {
            var action = actions[i];
            action.actionPayload.action_name = action.name;
            action.actionPayload.src_table = gr.getTableName();
            action.actionPayload.src_sys_id = gr.getValue('sys_id');
        }
    }
};
/**
 * Public Methods
 **/
SOWEvamPostProcessor.process = function(evamData, configuration) {
    try {
        if (evamData && configuration) {
	    if(typeof configuration == "string")
		configuration = JSON.parse(configuration);
            var items = evamData.items;
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var propValues = item.propValues;
                    if (propValues) {
                        var model = propValues.model;
                        var table = model.table;
                        var sysId = model.sysId;
                        var recordFieldsPresent = false == gs.nil(table) && false == gs.nil(sysId);
                        if (recordFieldsPresent) {
                            var gr = new GlideRecordSecure(table);
                            if (gr.get(sysId)) {
                                var mainActions = propValues.mainActions;
                                var overflowActions = propValues.overflowActions;
                                // Decorate action payloads
                                var fields = {};
                                var tempGr = new GlideRecordSecure(gr.getTableName());
                                tempGr.initialize();
                                for (var k in tempGr) {
                                    fields[k] = {
                                        value: gr.getValue(k)
                                    };
                                }
                                propValues.fields = fields;

                                SOWEvamPostProcessor._enhanceActionPayloads(mainActions, gr);
                                SOWEvamPostProcessor._enhanceActionPayloads(overflowActions, gr);

                                // Run transforms
                                var tableXformCfg = configuration[table];
                                if (tableXformCfg) {
                                    var xForms = tableXformCfg.transforms ? tableXformCfg.transforms : {};
                                    for (var xfk in xForms) {
                                        var xForm = xForms[xfk];
                                        var encodedQuery = xForm.query;
                                        var matches = gs.nil(encodedQuery) ? true : GlideFilter.checkRecord(gr, encodedQuery);
                                        if (matches) {
                                            var propXforms = xForm.propValues;
                                            SOWEvamPostProcessor._replacePropValues(propValues, propXforms, gr);
                                            propValues.mainActions = SOWEvamPostProcessor._replaceActions(mainActions, xForm.mainActions, gr);
                                            propValues.overflowActions = SOWEvamPostProcessor._replaceActions(overflowActions, xForm.overflowActions, gr);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        gs.error("Error", e);
        evamData.error = JSON.stringify(e);
    }
    return evamData;
};
SOWEvamPostProcessor.prototype = {
    type: 'SOWEvamPostProcessor',
    initialize: function() {}
};
