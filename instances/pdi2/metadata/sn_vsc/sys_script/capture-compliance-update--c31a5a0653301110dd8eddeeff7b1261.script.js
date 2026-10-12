
    (function executeRule(current, previous /*null when async*/ ) {
        // Capture latest compliance status in sn_vsc_harc_compliance_status_lookup to reflect previous compliance status in upgrade
        var grComplianceStatus = new GlideRecord('sn_vsc_harc_compliance_status_lookup');
        if (grComplianceStatus.get('harc_setting', current.sys_id)) {
            if (grComplianceStatus.harc_compliance_status != current.compliance_status) {
                // capture setting as updated
                generateUpdatedSetting(current.sys_id, current.compliance_status);
            }
        } else if (current.harc_baseline_version == 'Baseline v5') {
            //mark setting as updated setting if it is a new setting from the new baseline
            generateUpdatedSetting(current.sys_id, current.compliance_status);
        } else {
            var gr = new GlideRecord("sys_audit");
            var encodedQuery = "tablename=sn_vsc_instance_hardening_settings^documentkey=" + current.sys_id;
            gr.addEncodedQuery(encodedQuery, true);
            gr.orderByDesc("sys_created_on");
            gr.query();
            if (gr.next() && gr.getRowCount() > 0) {
                // If there is just entry into the sys_audit table, oldvalue needs to be compared with the changed value ( if at all it was change )
                if (gr.getRowCount() == 1) {
                    if (current.compliance_status != gr.oldvalue) {
                        generateUpdatedSetting(current.sys_id, current.compliance_status);
                    }
                } else {
                    /*
                        If there is more than one entry into the sys_audit table, we will compare from second most recently updated record
                        Reason : 
                        By the time BR is kicked off, sys_audit would have received an entry already. 
                        And hence the second most recently created entry is considered
                    */
                    gr.next();
                    if (current.compliance_status != gr.newvalue) {
                        generateUpdatedSetting(current.sys_id, current.compliance_status);
                    }
                }
            }

        }

        // Insert changed setting for comparision
        function generateUpdatedSetting(harcId, complianceStatus) {
            var gr = new GlideRecord("sn_vsc_updated_settings");
            gr.addQuery('u_setting', harcId);
            gr.orderByDesc('sys_created_on');
            gr.query();
            if (gr.next() && gr.u_compliance_state == complianceStatus) {
                return;
            } else {
                gr.initialize();
                gr.u_setting = harcId;
                gr.u_compliance_state = complianceStatus;
                gr.insert();
            }
        }
    })(current, previous);
