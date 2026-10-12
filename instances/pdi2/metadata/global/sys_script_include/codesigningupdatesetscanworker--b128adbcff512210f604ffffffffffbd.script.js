var CodeSigningUpdateSetScanWorker = Class.create();
CodeSigningUpdateSetScanWorker.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    start: function() {
        // Authorization check
        if (!gs.hasRole('codesigning_base_admin')) {
            gs.error('CodeSigningUpdateSetScanWorker: Access denied. Only users with codesigning_base_admin privileges are authorized to execute.');
            return;
        }

        var updateSetSysId = this.getParameter('sysparm_sys_id');
        if (!GlideStringUtil.isEligibleSysID(updateSetSysId)) {
            gs.error('CodeSigningUpdateSetScanWorker: Invalid sys_id provided: ' + updateSetSysId);
            return;
        }
        var tableName = this.getParameter('sysparm_table_name');
        if (!GlideTableDescriptor.isValid(tableName)) {
            gs.error("CodeSigningUpdateSetScanWorker: Invalid table_name provided");
            return;
        }

        var progressWorkerName = gs.getMessage('Signature Scan');
        var scriptIncludeName = 'CodeSigningUtil';
        var scriptIncludeMethod = 'scanUpdateSetForSignatures';

        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName(progressWorkerName);
        worker.setScriptIncludeName(scriptIncludeName);
        worker.setScriptIncludeMethod(scriptIncludeMethod);

        worker.putMethodArg("updateSetSysId", updateSetSysId);
        worker.putMethodArg("tableName", tableName);

        worker.setBackground(true);
        worker.start();
        return worker.getProgressID();
    },

    type: 'CodeSigningUpdateSetScanWorker'
});
