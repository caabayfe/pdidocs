
    /* Update the Host cpu core count label on table ecc_agent */
    var updateEccAgent = new GlideRecord('sys_dictionary');
    updateEccAgent.addQuery('name', 'ecc_agent');
    updateEccAgent.addQuery('element', 'host_cpu_core_count');
    updateEccAgent.query();
    if (updateEccAgent.next()) {
        updateEccAgent.setValue('column_label', 'Host physical processor/core count');
        updateEccAgent.update();
    }

    /* Update the Host cpu core count hint on table ecc_agent */
    var documentationGr = new GlideRecord('sys_documentation');
    documentationGr.addQuery('name', 'ecc_agent');
    documentationGr.addQuery('element', 'host_cpu_core_count');
    documentationGr.query();
    if (documentationGr.next()) {
        documentationGr.setValue('hint', 'For Windows MID Servers: number of physical processors currently available on a system. For Linux MID Servers: number of physical cores (note that if hyperthreading is enabled, there may be logical processors included in the count)');
        documentationGr.update();
    }

    /* Make name field mandatory on ecc_agent_script_include */
    var updateEccAgentScript = new GlideRecord('sys_dictionary');
    updateEccAgentScript.addQuery('name', 'ecc_agent_script_include');
    updateEccAgentScript.addQuery('element', 'name');
    updateEccAgentScript.query();
    if (updateEccAgentScript.next()) {
        updateEccAgentScript.setValue('mandatory', 'true');
        updateEccAgentScript.update();
}
