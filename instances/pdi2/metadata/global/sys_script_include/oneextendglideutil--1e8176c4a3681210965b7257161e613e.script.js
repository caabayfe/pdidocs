var OneExtendGlideUtil = Class.create();
OneExtendGlideUtil.prototype = {
    initialize: function() {},

    updateRecord: function(table, sysId, props) {
        if (gs.hasRole('admin') || gs.hasRole('sn_nowassist_admin.nsa_admin')) {
            try {
                var gr = new GlideRecord(table);
                var result = false;
                if (gr.get(sysId)) {
                    for (var key in props) {
                        gr.setValue(key, props[key]);
                    }
                    result = gr.update();
                    if (result) {
                        return result;
                    } else {
                        gs.error("Record update failed, please check the permission/role");
                    }
                } else
                    gs.error("No record found");
            } catch (err) {
                gs.error("Updation of record failed to perform the operation" + JSON.stringify(err));

            }
        }
        gs.error("Record update failed, please check the permission/role");
        return false;
    },

    insertRecord: function(table, props) {
        if (gs.hasRole('admin') || gs.hasRole('sn_nowassist_admin.nsa_admin')) {
            try {
                var gr = new GlideRecord(table);
                var result = false;
                for (var key in props) {
                    gr.setValue(key, props[key]);
                }
                result = gr.insert();
                if (result) {
                    return result;
                } else {
                    gs.error("Record insert failed, please check the permission/role ");
                }
            } catch (err) {
                gs.error("Insertion of record failed to perform the operation" + JSON.stringify(err));
            }
        }
        gs.error("Record insert failed, please check the permission/role ");
        return false;
    },

    deleteRecords: function(table, sysIds) {
        if (gs.hasRole('admin') || gs.hasRole('sn_nowassist_admin.nsa_admin')) {
            try {
                var result = false;
                var gr = new GlideRecord(table);
                gr.addQuery('sys_id', sysIds);
                gr.query();
                if (gr.next()) {
                    gr.deleteMultiple(); // deleteMultiple will not return any status.
                    return true;
                } else {
                    gs.error("There is no record to delete");
                    return false;
                }
            } catch (err) {
                gs.error("Deletion of records failed to perform the operation" + JSON.stringify(err));
            }
        }
        gs.error("Record deletion failed, please check the permission/role");
        return false;
    },

    checkLLMModelAvailability: function() {
        return true;
    },
    checkModelAvailability: function(capabilityId) {
        var request = {
            "executionRequests": [{
                "payload": {
                    "description": "Is gpt-4o model is available?"
                },
                "capabilityId": capabilityId
            }]
        };
        try {
            var response = sn_one_extend.OneExtendUtil.execute(request).capabilities[capabilityId];
            return (response.status === 'success');
        } catch (e) {
            gs.error("Error executing one extend capability: ", e.toString());
            return false;
        }
    },

    type: 'OneExtendGlideUtil'
};
