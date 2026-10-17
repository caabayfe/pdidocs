var log = '';
log += 'EM - add indexes to impact status- zboot fix script is start running \n\n';
var al = GlideStringUtil.split('vt_end, impact_status_key');
var id = new GlideIndexDescriptor('em_impact_status', 'vt_end', al);
var exists = id.hasIndex();
if (!exists) {
    log += 'Creating new indexes\n';
    var startTime = new Date();
    addIndexes();
    var endTime = new Date();
    var elapsedTime = endTime - startTime;
    log += 'Total time elapsed for creating a new indexes for impact status table is: ' + elapsedTime + '\n';
}
gs.info(log);

// Function to check if it's a new customer
function isNewInstance() {
    var CREATE_INDEXES_FOR_IMPACT_STATUS_THRESHOLD = "impact.create_indexes_for_impact_status_threshold";
    var propertyValue = gs.getProperty(CREATE_INDEXES_FOR_IMPACT_STATUS_THRESHOLD, 50000);
    if (!new GlideRecord('em_impact_status').isValid()) {
        log += 'em_impact_status table is not valid\n';
        return true;
    }
    var impactStatusGR = new GlideRecord('em_impact_status');
    impactStatusGR.setLimit(propertyValue);
    impactStatusGR.query();
    return impactStatusGR.getRowCount() < propertyValue;
}

function addIndexes() {
    if (isNewInstance()) {
        createNewIndex('em_impact_status', 'vt_end, impact_status_key', 'vt_end_2');
        createNewIndex('em_impact_status', 'element_id, vt_end', 'element_id_2');
    }
}

function createNewIndex(table, fields, indexName) {
    var al = GlideStringUtil.split(fields);
    var id = new GlideIndexDescriptor(table, indexName, al);
    id.create();
}
