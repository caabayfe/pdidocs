var ChangeSysClassName = Class.create();
ChangeSysClassName.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    type: 'ChangeSysClassName',
    ajaxFunction_changeSysClassName: function() {
        var updateCount = 0;
        var offeringCount = 0;
        var acceptedSourceTables = ['cmdb_ci_service'];
        var acceptedTargetTables = ['cmdb_ci_service_business', 'cmdb_ci_service_technical'];
        var selectedId = this.getParameter('sysparm_selected_id');
        var sourceTable = this.getParameter('sysparm_table_label');
        var targetTable = this.getParameter('sysparm_sys_class_name');
        var serviceClass = this.getParameter('sysparm_service_classification');

        // Force source table string string for only cmdb_ci_service and target table to be cmdb_ci_service_business or cmdb_ci_service_technical
        if (acceptedSourceTables.indexOf(sourceTable + "") < 0 || acceptedTargetTables.indexOf(targetTable + "") < 0) {
            return;
        }
		
        var gr = new GlideRecordSecure(sourceTable);
        gr.addQuery("sys_id", "IN", selectedId);
        gr.query();
        while (gr.next()) {
            if (gr.sys_class_name == "service_offering") {
                offeringCount++;
            } else {
                updateCount++;
                gr.sys_class_name = targetTable;
                gr.service_classification = serviceClass;
                if (gr.update()) {
                    //Update attachments
                    var attachmentGr = new GlideRecordSecure('sys_attachment');
                    attachmentGr.addQuery('table_sys_id', gr.getValue('sys_id'));
                    attachmentGr.query();

                    attachmentGr.setValue('table_name', targetTable);
                    attachmentGr.updateMultiple();
                }
            }
        }
        return offeringCount + "," + updateCount;
    },
});
