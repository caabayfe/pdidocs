var isAuditDisabled = function(attributes) {
        var attrs = attributes.split(',');
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i].trim();
            if (attr == 'no_audit=true')
            return true;
        }
        return false;
    };

    var disableAuditForColumn = function (column) {
        var hccDict = new GlideRecord('sys_dictionary');
        hccDict.addQuery('name', 'hermes_cluster_config');
        hccDict.addQuery('element', column);
        hccDict.setLimit(1);
        hccDict.query();
        if (hccDict.next()) {
            var attributes = hccDict.getValue('attributes');
            if (attributes != null) {
                if (!isAuditDisabled(attributes)) {
                    gs.log('Updating hermes_cluster_config column: ' + column + ' to disable auditing');
                    if (attributes.length != 0) {
                        attributes = attributes + ',no_audit=true';
                    } else {
                        attributes = 'no_audit=true';
                    }
                    hccDict.setValue('attributes', attributes);
                    hccDict.update();
                } else {
                    gs.log('Audit already disabled for hermes_cluster_config column: ' + column);
                }
            } else {  // In case attributes field is not set yet
                gs.log('Updating hermes_cluster_config column: ' + column + ' to disable auditing');
                attributes = 'no_audit=true';
                hccDict.setValue('attributes', attributes);
                hccDict.update();
            }
        }
    };

    var enableAuditForColumn = function (column) {
        var hccDict = new GlideRecord('sys_dictionary');
        hccDict.addQuery('name', 'hermes_cluster_config');
        hccDict.addQuery('element', column);
        hccDict.setLimit(1);
        hccDict.query();
        if (hccDict.next()) {
            var audit = hccDict.getValue('audit');
            if (audit == 0) {
                gs.log('Updating hermes_cluster_config column: ' + column + ' to enable auditing');
                hccDict.setValue('audit', 1);
                hccDict.update();
            } else {
                gs.log('Audit already enabled for hermes_cluster_config column: ' + column);
            }
        }
    };

    var enableAudit = function() {
        var hccDict = new GlideRecord('sys_dictionary');
        hccDict.addQuery('name', 'hermes_cluster_config');
        hccDict.addNullQuery('element');
        hccDict.setLimit(1);
        hccDict.query();
        gs.log('Checking if hermes_cluster_config is enabled for audit...');
        if (hccDict.next()) {
            var isAudit = hccDict.getValue('audit');
            if (isAudit == 0) {
                gs.log('Updating hermes_cluster_config audit to true');
                hccDict.setValue('audit', 1);
                hccDict.update();
                gs.log('hermes_cluster_config audit enabled');
            } else {
                gs.log('hermes_cluster_config is already audit enabled');
            }
        }
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'hermes_cluster_config');
        gr.query();
        while (gr.next()) {
            var column = gr.getValue('element');
            if (column === 'cluster_seq' || column === 'num_in_a_row' || column === 'last_status_time') {
                disableAuditForColumn(column);
            } else {
                enableAuditForColumn(column);
            }
        }
    };
    enableAudit();
    
