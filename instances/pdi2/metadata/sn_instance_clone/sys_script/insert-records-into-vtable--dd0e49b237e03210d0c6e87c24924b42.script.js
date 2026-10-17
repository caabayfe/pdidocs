(function executeRule(current, previous /*null when async*/) {
    try {
        var VTABLE = 'sn_instance_clone_request_vtable';
        var SRC_TABLE = 'sn_instance_clone_request';

        // Check if VTable is empty
        var vCheck = new GlideRecord(VTABLE);
        vCheck.query();
        if (!vCheck.hasNext()) {
            // VTable is empty then insert all records from clone request
            var srcGr = new GlideRecord(SRC_TABLE);
            srcGr.query();
            while (srcGr.next()) {
                insertOrUpdateVTableRecord(srcGr);
            }
        } else {
            // VTable has records then process only the current record
            // Delete existing VTable record for this request
            var vtableGr = new GlideRecord(VTABLE);
            vtableGr.addQuery('request_sys_id', current.sys_id);
            vtableGr.query();
            while (vtableGr.next()) {
                vtableGr.deleteRecord();
            }

            // Insert the current record
            insertOrUpdateVTableRecord(current);
        }

    } catch (ex) {
        gs.error("[Clone Request VTable Script] Error: " + ex.message + " | Line: " + ex.lineNumber);
    }

    function insertOrUpdateVTableRecord(record) {
        var newVtableGr = new GlideRecord('sn_instance_clone_request_vtable');
        newVtableGr.initialize();

        var fieldNames = Object.keys(record);
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            if (fieldName.startsWith("sys_")) continue;

            if (fieldName === "target_instance" || fieldName === "source_instance") {
                var gr = new GlideRecord('instance');
                var i_sys_id = record.getValue(fieldName);
                if (gr.get(i_sys_id)) {
                    if (fieldName === "target_instance") {
                        newVtableGr.target_instance = gr.instance_name.getDisplayValue();
                        newVtableGr.target_instance_id = i_sys_id;
                    } else if (fieldName === "source_instance") {
                        newVtableGr.source_instance = gr.instance_name.getDisplayValue();
                        newVtableGr.source_instance_id = i_sys_id;
                    }
                } else {
                    newVtableGr.source_instance = gs.getProperty("instance_name");
                    newVtableGr.source_instance_id = gs.getProperty("instance_id");
                }
            } else if (fieldName === "email") {
                var emailField = record.getValue('email');
                var userEmails = [];
                if (emailField) {
                    var parts = emailField.split(',');
                    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    for (var j = 0; j < parts.length; j++) {
                        var part = parts[j].trim();
                        if (emailRegex.test(part)) {
                            userEmails.push(part);
                        } else if (part.length == 32) {
                            var userGR = new GlideRecord('sys_user');
                            if (userGR.get(part)) {
                                userEmails.push(userGR.getValue('email'));
                            }
                        }
                    }
                }
                newVtableGr.email = userEmails.join(', ');
            } else if (fieldName === "parent_request_id") {
                var parentSysId = record.getValue('parent_request_id');
                if (parentSysId) {
                    var parentGR = new GlideRecord('sn_instance_clone_request');
                    if (parentGR.get(parentSysId)) {
                        newVtableGr.parent_request_id = parentGR.getValue('request_id');
                    }
                }
            } else if (fieldName === "clone_request_id_for_backup") {
                var parentSysId1 = record.getValue('clone_request_id_for_backup');
                if (parentSysId1) {
                    var parentGR1 = new GlideRecord('sn_instance_clone_request');
                    if (parentGR1.get(parentSysId1)) {
                        newVtableGr.clone_request_id_for_backup = parentGR1.getValue('request_id');
                    }
                }
            } else if (newVtableGr.isValidField(fieldName)) {
                newVtableGr.setValue(fieldName, record.getValue(fieldName));
            }
        }

        // Set instance_id and request_sys_id
        newVtableGr.instance_id = gs.getProperty('instance_id');
        newVtableGr.request_sys_id = record.sys_id;

        // Insert the new record
        newVtableGr.insert();
    }
})(current, previous);
