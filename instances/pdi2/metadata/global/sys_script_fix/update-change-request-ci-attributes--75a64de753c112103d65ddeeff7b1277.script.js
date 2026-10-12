var CHG_DICTIONARY_OVERRIDE_SYS_ID = "3f45658fcb102200dff9b9c0c24c9c7c";
var ORDER_BY_ATTRIBUTE_NAME = 'ref_ac_order_by';
var ORDER_BY_ATTRIBUTE_VALUE = 'sys_class_name';

if (!pm.isZboot()) {
    gs.info("[Update Change Request CI Attributes]: Execution started");
    removeAttribute(CHG_DICTIONARY_OVERRIDE_SYS_ID, ORDER_BY_ATTRIBUTE_NAME, ORDER_BY_ATTRIBUTE_VALUE);
    gs.info("[Update Change Request CI Attributes]: Execution finished");
}

function removeAttribute(overrideSysId, attributeName, attributeValue) {
    var overrideGr = new GlideRecord('sys_dictionary_override');
    if (overrideGr.get(overrideSysId) && !isRecordCustomized(overrideGr)) {
        updateAttributes(overrideGr, attributeName, attributeValue);
    } else {
        gs.info("[Update Change Request CI Attributes]: Either the Change request's Configuration item field OOB override record doesn't exist or it has been customized");
    }
}

function isRecordCustomized(recordGr) {
    return !sn_collision.CollisionAPI.willBeReplacedOnUpgrade(recordGr);
}

function updateAttributes(overrideGr, attributeName, attributeValue) {
    var currentAttributes = "";
    if (overrideGr.getValue('attributes_override') == 1) {
        currentAttributes = new GlideAttributes(overrideGr.getValue("attributes"));
        if (attributeValue == currentAttributes.getAttribute(attributeName)) {
            currentAttributes.removeAttribute(attributeName);
            overrideGr.setValue("attributes", currentAttributes.serializeAttributes());
            if (overrideGr.update()) {
                gs.info("[Update Change Request CI Attributes]: Successfully updated the attributes");
            } else {
                gs.info("[Update Change Request CI Attributes]: Failed to update the attributes");
            }
        }
    }
}
