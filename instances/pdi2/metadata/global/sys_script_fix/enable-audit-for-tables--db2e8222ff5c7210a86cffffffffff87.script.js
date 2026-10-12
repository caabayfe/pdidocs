function addPrefixToAttributes(record, prefix) {
    var attributes = record.getValue('attributes') || '';
    if (!attributes.includes(prefix)) {
        attributes = prefix + attributes;
        record.setValue('attributes', attributes);
        record.update();
    }
}

function setAuditTrue(record) {
    record.setValue('audit', true);
    record.update();
}

function setAuditForDict(tableName) {
    var dictGr = new GlideRecord('sys_dictionary');
    dictGr.addQuery('name', tableName);
    dictGr.addQuery('internal_type', 'collection');
    dictGr.query();
    if (dictGr.next()) {
        setAuditTrue(dictGr);
    } else {
        gs.error('Could not set audit=true for ' + tableName + ' in dictionary');
    }
}

function updateAttributesForDict(tableName, elementName, prefix) {
    var dictGr = new GlideRecord('sys_dictionary');
    dictGr.addQuery('name', tableName);
    if (elementName) {
        dictGr.addQuery('element', elementName);
    } else {
        dictGr.addQuery('internal_type', 'collection');
    }
    dictGr.query();
    if (dictGr.next()) {
        addPrefixToAttributes(dictGr, prefix);
    } else {
        gs.error('Record not found ' + tableName + (elementName ? ':' + elementName : '') + ' in dictionary');
    }
}
try {
    if (!pm.isZboot()) {

        updateAttributesForDict('sys_pd_activity_context', null, 'audit_type=whitelist,');
        updateAttributesForDict('sys_pd_activity_context', 'state', 'audit=true,');
        updateAttributesForDict('sys_pd_context', null, 'audit_type=whitelist,');
        updateAttributesForDict('sys_pd_context', 'state', 'audit=true,');

        setAuditForDict('sys_pd_context');
        setAuditForDict('sys_pd_activity_context');
    }
} catch (ex) {
    gs.log("Couldn't update the context tables " + JSON.stringify(ex));
}
