const ProcessDefinitionService = (function() {
    return class ProcessDefinitionService {
        static type = "ProcessDefinitionService";
        static #TABLE_NAME = "sys_pd_process_definition";

        static getProcessesInRequestApp(requestAppId, queryString = "") {
            const requestApp = RequestAppService.getById(requestAppId);
            const result = [];

            const triggerGr = new GlideRecordSecure("sys_pd_trigger_instance");
            triggerGr.addQuery("process_definition.sys_scope", requestApp.scopeId);
            triggerGr.addEncodedQuery(queryString, true);
            triggerGr.orderBy("process_definition.label");
            triggerGr.query();

            while (triggerGr.next()) {
                const table = triggerGr.trigger_inputs.table;
                if (table.toString() === requestApp.requestTable) {
                    result.push({
                        sysId: triggerGr.getValue("process_definition"),
                        label: triggerGr.getDisplayValue("process_definition"),
                        active: triggerGr.process_definition.active,
                        status: triggerGr.process_definition.status,
                        designerState: triggerGr.process_definition.designer_state
                    });
                }
            }

            return result;
        }
    };
})();
