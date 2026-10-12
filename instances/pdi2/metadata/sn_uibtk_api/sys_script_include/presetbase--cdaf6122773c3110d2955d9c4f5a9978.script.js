const PresetBase = Class.create();
PresetBase.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    initialize: function(fields, fieldTypes = {}) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, undefined, undefined, fieldTypes);
    },
    getRecordsByQuery: function(encodedQuery, orderBy) {
        const propsConfigHandler = new PropsConfig();
        const presetGRs = BuilderToolkitAPIBase.prototype.getRecordsByQuery.call(this, encodedQuery, orderBy);
        return propsConfigHandler.addPropConfigToResponse(presetGRs, this.TABLE);
    },
    /**
     * @param presetArray {array} converts an array of presets into object by component ID
     */
    convertPresetDefinitions: function(presetArray) {
        return presetArray.reduce(function(acc, preset) {
            const componentId = preset.isRepeater ? BuilderToolkitConstants.REPEATER : preset.component || preset.controller;
            if (!acc[componentId]) {
                acc[componentId] = [];
            }
            acc[componentId].push(preset);
            return acc;
        }, {});
    },

    /**
     * Gets the list of event apiNames for event mappings and event targets for a list of presets
     */
    getPresetEventDefinitionApiNames: function(presetDefinitions) {
        const eventNames = [];
        (Array.isArray(presetDefinitions) ? presetDefinitions : []).forEach(({
            eventHandlers
        }) => {
            (Array.isArray(eventHandlers) ? eventHandlers : []).forEach((mapping) => {
                if (mapping.sourceEventDefinition && mapping.sourceEventDefinition.apiName) {
                    const apiNameArr = mapping.sourceEventDefinition.apiName.split('.');
                    eventNames.push(apiNameArr[1]);
                }
                (Array.isArray(mapping?.targets) ? mapping.targets : []).forEach((target) => {
                    if (target?.event?.apiName) {
                        const apiNameArr = (target.event.apiName ?? '').split('.');
                        eventNames.push(apiNameArr[1]);
                    }
                });
            });
        });
        return eventNames;
    },

    type: 'PresetBase'
});
