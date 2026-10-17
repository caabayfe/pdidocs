/**
 * Inline invalidation script for the "Conversational Cache Configuration" form.
 * Input:  recordSysId — sys_id of the changed sys_properties row.
 * Output: array of Valkey cache key patterns to invalidate.
 */
(function () {

    if (!recordSysId) {
        throw new Error("invalid argument. recordSysId is empty");
    }

    var gr = new GlideRecord("sys_properties");
    if (!gr.get(recordSysId)) {
        return [];
    }
    var name = gr.getValue("name");
    if (!name) {
        return [];
    }

    var WHITELIST = {
        // ---------------- agent-orchestrator ----------------
        "sn_aia.og_ao.override_llm_config": 1,
        "sn_aia.og_ao.agents_orchestration_threshold": 1,
        "sn_aia.og_ao.max_allowed_preferred_agents": 1,
        "sn_aia.og_ao.planner2.max_user_turns": 1,
        "sn_aia.og_ao.max_allowed_turn_for_run": 1,
        "sn_aia.continuous_tool_execution_limit": 1,
        "sn_aia.og_ao.runner_run_timeout_seconds": 1,
        "sn_aia.type_1_disamb": 1,
        "sn_aia.type_2_disamb": 1,
        "sn_aia.type2_disamb_low_threshold": 1,
        "sn_aia.type2_disamb_high_threshold": 1,
        "dare.brand.tokens": 1,
        "com.glide.cs.genai.disable_view_more_records": 1,
        "sn_ais_assist.synthesized_answer.max_num_kg_items": 1,
        "sn_ais_assist.kgnlq_limit_column_output": 1,
        "sn_aia.sn_ais_assist.kgnlq_enable_field_labels": 1,
        "glide.sys.date_format": 1,
        "glide.sys.time_format": 1,
        "glide.sys.default.tz": 1,
        "sn_aia.og_ao.log_level": 1,
        "sn_aia.og_ao.aia_prompt_version": 1,
        "sn_aia.og_ao.use_instance_prompt": 1,
        "sn_aia.og_ao.aia_enable_kg_widgets_using_aix_api": 1,
        "sn_aia.og_ao.aia_enable_kg_field_labels": 1,
        "sn_aia.og_ao.aia_kg_widget_generator": 1,
        "sn_aia.og_ao.enable_widget_data_tools": 1,
        "sn_aia.og_async_enabled_tool_types": 1,
        "sn_aia.og_ao.enable_agentic_catalog": 1,
        "sn_aia.og_ao.enable_processing_messages": 1,
        "glide.cs.nextwave.log.level": 1,
        "sn_aia.og_ao.log_non_redaction": 1,
        "sn_now_assist_cr.og_ao.catalog_agent.sys_id": 1,
        "sn_nowassist_va.synthesized_autostart_items": 1,
        "sn_vad_genai.offglide.closure.handler": 1,
        "sn_aia.og.default_utterance_for_attachments": 1,
        "com.glide.cs.live_agent_not_configured": 1,

        // ---------------- agent-orchestrator-v2----------------
        "sn_aia.route_chat_via_ao_v2": 1,
        "sn_aia.og_ao.sandbox.timeout_seconds": 1,

        // ---------------- conversation-server ----------------
        "sn_nowassist_va.nextwave_anlaytics_enabled": 1,
        "sn_nowassist_va.nextwave_analytics_feature_parity": 1,

        // ---------------- central-cache-service ----------------
        "com.glide.cs.offglide.cache_batch_enable": 1
    };

    if (!WHITELIST.hasOwnProperty(name)) {
        return [];
    }

    return ["property|name:" + name];
})();
