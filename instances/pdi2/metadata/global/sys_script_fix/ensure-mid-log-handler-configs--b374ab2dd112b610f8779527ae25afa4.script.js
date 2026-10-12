var PROPERTIES = {
    'com.service_now.mid.logging.MIDLogFileHandler.compression': {
        sys_id: '594bf202a391421018141b66471e61ee',
        defaultValue: 'none'
    },
    'com.service_now.mid.logging.MIDLogFileHandler.cleanupOnStart': {
        sys_id: '0ddb3e02a391421018141b66471e61d3',
        defaultValue: 'false'
    },
    'com.service_now.mid.logging.MIDLogFileHandler.limit': {
        sys_id: '6dda3ecea351421018141b66471e61b1',
        defaultValue: '10000000'
    },
    'com.service_now.mid.logging.MIDLogFileHandler.count': {
        sys_id: '1041fcc6a311421018141b66471e6101',
        defaultValue: '10'
    }
};

for (var propertyName in PROPERTIES) {
    if (!PROPERTIES.hasOwnProperty(propertyName))
        continue;

    var config = PROPERTIES[propertyName];

    var gr = new GlideRecord('ecc_agent_property');
    gr.addQuery('name', propertyName);
    gr.addNullQuery('ecc_agent');
    gr.addQuery('sys_domain', 'global');
    gr.query();

    var oobExists = false;
    var preservedValue = null;

    if (gr.next()) {
        if (gr.getUniqueValue() === config.sys_id) {
            oobExists = true;
        } else {
            preservedValue = gr.getValue('value');
            gs.warn('Removing non-OOB global ecc_agent_property {0} (sys_id={1})', propertyName, gr.getUniqueValue());
            gr.deleteRecord();
        }
    }

    if (oobExists)
        continue;

    var newPropGR = new GlideRecord('ecc_agent_property');
    newPropGR.initialize();
    newPropGR.setNewGuidValue(config.sys_id);
    newPropGR.setValue('name', propertyName);
    newPropGR.setValue('value', preservedValue !== null ? preservedValue : config.defaultValue);
    newPropGR.insert();

    gs.info('Inserted OOB ecc_agent_property {0} with sys_id {1}', propertyName, config.sys_id);
}
