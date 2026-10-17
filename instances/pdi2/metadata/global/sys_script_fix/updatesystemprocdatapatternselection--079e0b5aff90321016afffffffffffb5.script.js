gs.info('Running the fix script to update default data pattern selection for privacy system processor configurations');
updateDefaultDataPatternSelection();

function updateDefaultDataPatternSelection() {
    if (pm.isZboot())
        return;

    var FIELD_DATA_PATTERN_SELECTION = 'data_pattern_selection';
    var TABLE_SYSTEM_PROCESSOR_CONFIG = 'dp_system_processor_configuration';
    var DEFAULT_DATA_PATTERN_SELECTION = 'custom';

    var systemProcConfigGr = new GlideRecord(TABLE_SYSTEM_PROCESSOR_CONFIG);

    if (!systemProcConfigGr.isValid() || !systemProcConfigGr.isValidField(FIELD_DATA_PATTERN_SELECTION)) {
        gs.info(`Skipping updation of data pattern selection. Either the table ${TABLE_SYSTEM_PROCESSOR_CONFIG} or the field ${FIELD_DATA_PATTERN_SELECTION} is invalid.`);
        return;
    }

    systemProcConfigGr.addNullQuery(FIELD_DATA_PATTERN_SELECTION);
    systemProcConfigGr.setValue(FIELD_DATA_PATTERN_SELECTION, DEFAULT_DATA_PATTERN_SELECTION);
    systemProcConfigGr.updateMultiple();

    // query after update to verify no null values exist
    systemProcConfigGr.query();
    if (systemProcConfigGr.getRowCount() > 0)
        gs.error(`Failed to update default data pattern selection for ${systemProcConfigGr.getRowCount()} privacy system processor configuration records`);
    else
        gs.info(gs.getMessage('Successfully updated default data pattern selection for privacy system processor configurations'));
}
