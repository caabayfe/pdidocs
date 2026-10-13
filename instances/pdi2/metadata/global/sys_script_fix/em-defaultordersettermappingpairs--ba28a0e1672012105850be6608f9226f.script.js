var LOG_PREFIX = 'EM - DefaultOrderSetterMappingPairs:';
gs.info(LOG_PREFIX + ' Started running');
var startTime = new GlideDateTime(); // Start time measurement
var EM_MAPPING_PAIR_TABLE = 'em_mapping_pair';
var ORDER_FIELD = 'order';
var DEFAULT_ORDER = 100;

function setOrderWithDefaultValue() {
    var updatedSysIds = [];
    var gr = new GlideRecord(EM_MAPPING_PAIR_TABLE);
    // Set default order only records where the 'order' is not set already
    gr.addNullQuery(ORDER_FIELD);
    gr.query();

    while (gr.next()) {
        gr.setValue(ORDER_FIELD, DEFAULT_ORDER);
        if (gr.update()) { // Add to updatedSysIds only if the update is successful
            updatedSysIds.push(gr.getUniqueValue());
        }
    }
    gs.info(LOG_PREFIX + ' Finished executing, updated order to be 100 in ' + updatedSysIds.length + ' records, with sysIds: ' + updatedSysIds.join(', ') + ' in em_mapping_pair.');
}

function doesColumnExistInTable(tableName, columnName) {
    var gr = new GlideRecord(tableName);
    gr.initialize();
    return gr.isValidField(columnName);
}

// check existance of 'order' column in 'em_mapping_pair'
var isOrderColumnExist = doesColumnExistInTable(EM_MAPPING_PAIR_TABLE, ORDER_FIELD);

// Don't execute if the order field does not exist
if (!isOrderColumnExist) {
    gs.info(LOG_PREFIX + ' Error: Field "' + ORDER_FIELD + '" does NOT exist in table "' + EM_MAPPING_PAIR_TABLE + '".');
} else {
    setOrderWithDefaultValue();
}

var endTime = new GlideDateTime(); // End time measurement
var elapsedSeconds = (endTime.getNumericValue() - startTime.getNumericValue()) / 1000; // Calculate time in seconds
gs.info(LOG_PREFIX + ' Script took ' + elapsedSeconds + ' seconds to execute.');
