try {
    gs.debug("[AIA ToolM2M Fix script: Started executing Fix agent , tool columns as non-mandatory");
    var agentElementGr = new GlideRecord("sys_dictionary");
    agentElementGr.addQuery("name", "sn_aia_agent_tool_m2m");
    agentElementGr.addQuery("element", "agent");
    agentElementGr.addQuery("mandatory", true);
    agentElementGr.setWorkflow(false);
    agentElementGr.query();
    if (agentElementGr.next()) {
        agentElementGr.setValue("mandatory", false);
        agentElementGr.update();
        gs.debug("[AIA ToolM2M Fix script: Successfully fixed agent column as non-mandatory");
    }

    var toolElementGr = new GlideRecord("sys_dictionary");
    toolElementGr.addQuery("name", "sn_aia_agent_tool_m2m");
    toolElementGr.addQuery("element", "tool");
    toolElementGr.addQuery("mandatory", true);
    toolElementGr.setWorkflow(false);
    toolElementGr.query();
    if (toolElementGr.next()) {
        toolElementGr.setValue("mandatory", false);
        toolElementGr.update();
        gs.debug("[AIA ToolM2M Fix script: Successfully fixed tool column as non-mandatory");
    }

    gs.debug("[AIA ToolM2M Fix script: Successfully finished executing Fix agent, tool columns as non-mandatory");
} catch (error) {
    gs.debug("[AIA ToolM2M Fix script: Failed to execute Fix agent, tool columns as non-mandatory with error: ", error);
}
