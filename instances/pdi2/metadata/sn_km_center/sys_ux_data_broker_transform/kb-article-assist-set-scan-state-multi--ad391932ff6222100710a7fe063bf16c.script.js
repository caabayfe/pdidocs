function transform(input) {
    if (!input) return {};
    var validMultiUpdateInput = !!(input.targetRecord && input.scanDefinition && input.newState);
    var validSingleUpdateInput = !!(input.sysId && input.newState);
    if (!validMultiUpdateInput && !validSingleUpdateInput) return {};

    function refreshArticleHealthScore(targetRecordId, targetTable, newState, scanDefinitionId) {
        // Only an ignore transition changes what the health score query counts
        // (it only reads state IN ('open','error')) — other state values reaching
        // this generic setter don't need a recalculation.
        if (newState !== 'ignore') return;
        if (!targetRecordId || !targetTable) return;
        if (!new sn_km_center.HealthScoreUtils().isHealthScoreEligible()) return;

        var articleGr = new GlideRecordSecure(targetTable);
        if (articleGr.get(targetRecordId)) {
            var healthScoreUtil = new sn_km_center.KBArticleHealthScoreUtil();
            // The stored per-row health_score was computed from ALL findings at scan
            // time, so a partial ignore leaves a stale value on the remaining open
            // rows. Recompute the affected scan's score from the still-open findings
            // before re-aggregating, without re-running the scan's detection logic.
            if (scanDefinitionId) {
                healthScoreUtil.recomputeScanResultHealthScoreForArticle(targetRecordId, scanDefinitionId);
            }
            healthScoreUtil.recalculateForArticle(articleGr);
        }
    }

    if (validMultiUpdateInput) {
        const {
            targetRecord,
            scanDefinition,
            newState
        } = input;

        // Create a new GlideRecord object for the kb_assist_scan_result table
        var gr = new GlideRecordSecure('kb_assist_scan_result');

        // Add query conditions to filter records by target_record and scan_definition
        gr.addQuery('target_record', targetRecord);
        gr.addQuery('scan_definition', scanDefinition);

        // Execute the query
        gr.query();

        var targetTable;
        var anyResultUpdated = false;
        // Iterate over the query results and update the state field
        while (gr.next()) {
            targetTable = gr.getValue('target_table');
            gr.setValue('state', newState);
            gr.update();
            anyResultUpdated = true;
        }

        if (anyResultUpdated) {
            refreshArticleHealthScore(targetRecord, targetTable, newState, scanDefinition);
        }
    } else if (validSingleUpdateInput) {
        var gr = new GlideRecordSecure('kb_assist_scan_result');
        gr.addQuery('sys_id', input.sysId);
        gr.query();
        if (gr.next()) {
            var targetRecordId = gr.getValue('target_record');
            var targetTable = gr.getValue('target_table');
            var scanDefinitionId = gr.getValue('scan_definition');
            gr.setValue('state', input.newState);
            gr.update();
            refreshArticleHealthScore(targetRecordId, targetTable, input.newState, scanDefinitionId);
        }
    }

}
