var NLUModelExporterAjax = Class.create();
NLUModelExporterAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    process: function() {
        var sysId = this.getParameter("sysparm_ajax_processor_sys_id");
        var gr = new GlideRecordSecure('sys_nlu_model');
        gr.get(sysId);

        // Run export in background
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName(gs.getMessage("Exporting Model"));
        worker.setScriptIncludeName("NLUModelExporter");
        worker.setScriptIncludeMethod("exportModel");
        worker.putMethodArg("modelGr", gr);
        worker.setSource(sysId);
        worker.setSourceTable("sys_nlu_model");
        worker.setBackground(true);
        worker.setCannotCancel(true);
        worker.start();
        return worker.getProgressID();
    },

    type: 'NLUModelExporterAjax'
});
