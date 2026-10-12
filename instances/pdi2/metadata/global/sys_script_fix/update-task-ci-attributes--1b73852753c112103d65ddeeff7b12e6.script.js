var TABLE_NAME = "task";
var FIELD_NAME = "cmdb_ci";
var ORDER_BY_ATTRIBUTE_NAME = 'ref_ac_order_by';
var ORDER_BY_ATTRIBUTE_VALUE = 'sys_class_name';

if (!pm.isZboot()) {
    gs.info("[Update Task CI Attributes]: Execution started");
    removeAttribute(TABLE_NAME, FIELD_NAME, ORDER_BY_ATTRIBUTE_NAME, ORDER_BY_ATTRIBUTE_VALUE);
    gs.info("[Update Task CI Attributes]: Execution finished");
}

function removeAttribute(tableName, fieldName, attributeName, attributeValue) {
    var dictionaryGr = new GlideRecord('sys_dictionary');
    dictionaryGr.addQuery('name', tableName);
    dictionaryGr.addQuery('element', fieldName);
    dictionaryGr.setLimit(1);
    dictionaryGr.query();
    if (dictionaryGr.next() && !isRecordCustomized(dictionaryGr)) {
        updateAttributes(dictionaryGr, attributeName, attributeValue);
    } else {
        gs.info("[Update Task CI Attributes]: Either the Task doesn't have Configuration item field or it has been customized");
    }
}

function isRecordCustomized(recordGr) {
    return !sn_collision.CollisionAPI.willBeReplacedOnUpgrade(recordGr);
}

function updateAttributes(dictionaryGr, attributeName, attributeValue) {
    var currentAttributes = new GlideAttributes(dictionaryGr.getValue("attributes"));
    if (attributeValue == currentAttributes.getAttribute(attributeName)) {
        currentAttributes.removeAttribute(attributeName);
        dictionaryGr.setValue("attributes", currentAttributes.serializeAttributes());
        if (dictionaryGr.update()) {
            gs.info("[Update Task CI Attributes]: Successfully updated the attributes");
        } else {
            gs.info("[Update Task CI Attributes]: Failed to update the attributes");
        }
    }
}
