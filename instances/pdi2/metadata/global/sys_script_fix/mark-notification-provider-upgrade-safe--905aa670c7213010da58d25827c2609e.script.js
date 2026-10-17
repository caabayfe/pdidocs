var propertyName = 'upgrade_safe';
var propertyValue = true;
var tableName = 'sys_trigger';
var recordSysId = 'ccb9ab720f3133005605539ac4767ef4';

function updateGlideRecord(pTableName, pRecordSysId, pPropertyName, pPropertyValue) {
    var gr = new GlideRecord(pTableName);
    if (gr.get(pRecordSysId)) {
        gr.setValue(pPropertyName, pPropertyValue);
        gr.update();
    }
}

if(!pm.isZboot())
    updateGlideRecord(tableName, recordSysId, propertyName, propertyValue);
