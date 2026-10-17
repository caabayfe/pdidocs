var systemProcessorTables = ['dp_system_processor_configuration', 'dp_m2m_configuration_pattern_global'];
removeUpdateSyncAttribute(systemProcessorTables);

function removeUpdateSyncAttribute(systemProcessorTables) {
    if (pm.isZboot())
        return;

    DICTIONARY_ATTRIBUTE_UPDATE_SYNC = 'update_synch';
    for (var i = 0; i < systemProcessorTables.length; i++) {
        tableName = systemProcessorTables[i];
        if (GlideTableDescriptor.isValid(tableName)) {
            SNC.DictionaryAttribute.remove(tableName, '', DICTIONARY_ATTRIBUTE_UPDATE_SYNC);
            gs.info('Successfully removed update_synch attribute from table ' + tableName);
        } else {
            gs.info('Could not remove update_synch attribute: invalid table ' + tableName);
        }
    }
}
