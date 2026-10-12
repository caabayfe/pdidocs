const ComponentPreset = Class.create();
ComponentPreset.prototype = Object.extendsObject(PresetBase, {
    TABLE: 'sys_ux_component_preset',
    FIELDS: ['name', 'component', 'controller','controller_dependencies', 'description', 'properties', 'event_handlers', 'hide_component', 'is_repeater', 'is_repeated_element', 'parent_repeater_preset', 'repeat_with', 'repeated_item_meta'],
    FIELD_TYPES: {
        name: 'translated_field',
        component: 'reference',
        controller: 'reference',
		controller_dependencies: 'json',
        description: 'translated_text',
        properties: 'json',
        event_handlers: 'json',
        hide_component: 'json',
        is_repeater: 'boolean',
        is_repeated_element: 'boolean',
        parent_repeater_preset: 'reference',
        repeat_with: 'json',
        repeated_item_meta: 'json'
    },

    initialize: function(fields, includeClientScripts = false) {
        PresetBase.prototype.initialize.call(this, fields || this.FIELDS, this.FIELD_TYPES);
        this.includeClientScripts = includeClientScripts;
    },

    /**
     * Overrides parent class function to inject special fields
     * @param acc {object} the accumulator object
     * @param field {GlideElement} the field element we are currently working on
     */
    getFieldValues: function(acc, field) {
        if (field.nil()) {
            return acc;
        }
        acc = BuilderToolkitAPIBase.prototype.getFieldValues.call(this, acc, field);
        const fieldName = field.getName();
        if (fieldName === 'properties' && !this.includeClientScripts) {
            const properties = this.parseJSON(field, {
                sysId: acc.sysId,
                field: 'properties'
            });
            acc['properties'] = Object.entries(properties).reduce(function(propsAcc, [key, value]) {
                if (value.type === 'CLIENT_TRANSFORM_SCRIPT') {
                    const scriptSysId = value?.script?.scriptSysId;
                    const clientScript = new ClientScript(['script']).getRecordById(scriptSysId, true);
                    if (clientScript) {
                        value = {
                            ...value,
                            script: {
                                ...value.script,
                                scriptSysId: '',
                                inlineScript: clientScript.getValue('script')
                            }
                        };
                    }
                }
                propsAcc[key] = value;
                return propsAcc;
            }, {});
        }
        return acc;
    },

    getRecordsByQuery: function(encodedQuery, orderBy) {
        const controllerHandler = new Controller();
        const clientScriptHandler = new ClientScript();
        return PresetBase.prototype.getRecordsByQuery.call(this, encodedQuery, orderBy).map((presetGR) => {
            const controllerGR = controllerHandler.getRecordById(presetGR.controller, true);
            const controllerMacroponentCategory = controllerGR && !controllerGR.controller_macroponent.nil() && !controllerGR.controller_macroponent.category.nil() ? controllerGR.controller_macroponent.category.toString() : '';
            if (this.includeClientScripts) {
                return {
                    ...presetGR,
                    controllerMacroponentCategory,
                    clientScripts: clientScriptHandler.getRecordsByQuery(`preset=${presetGR.sysId}`)
                };
            }
            return {
                ...presetGR,
                controllerMacroponentCategory,
            };
        });
    },

    type: 'ComponentPreset'
});
