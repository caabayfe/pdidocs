function transform(params) {
    // Early return if required plugin isn't active or template is missing
    if (gs.nil(params.template) || !GlidePluginManager.isActive('sn_km_gen_ai')) {
        return {
            success: false
        };
    }

    const api = new sn_km_center.KMOpenPromptUtils();
    let gapsSysIds = '';
    const tasksSysIds = [];
    if (!gs.nil(params.extra_params)) {
        const match = params.extra_params.match(/gapsSysIds:([^:\s]+)/);
        if (match) {
            gapsSysIds = match[1];
            const gr = new GlideRecordSecure("kb_gap_candidates");
            gr.addQuery("sys_id", 'IN', gapsSysIds);
            gr.query();

            while (gr.next()) {
                tasksSysIds.push(gr.getValue('task'));
            }
            return api.fetchConfigOptions(params.template, tasksSysIds.join(','), params.knowledge_base);
        }
    }

    // Fallback: no gapsSysIds found (or no extra_params at all)
    if (params.source_sys_id) {
        var incomingSourceId = params.source_sys_id;
        tasksSysIds.push(incomingSourceId);

    }
    return api.fetchConfigOptions(params.template, tasksSysIds.join(','), params.knowledge_base);
}
