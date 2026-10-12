function transform(input) {

    function _createVaActivityPattern(name, outcome, primaryActivityId) {
        var gr = new GlideRecord("ssa_activity_pattern");
        gr.initialize();
        gr.setValue('name', name);
        if (outcome)
            gr.setValue('outcome', outcome);
        if (primaryActivityId)
            gr.setValue('primary_activity', primaryActivityId);

        gr.setWorkflow(false);
        if (gr.canCreate())
            return gr.insert();

        return false;
    }

    function _createVaPrimaryActivity(primaryActvityTable, primaryActvityFilter) {
        var gr = new GlideRecord("sn_actsub_activity_type");
        gr.initialize();
        gr.setValue('activity_source_table', primaryActvityTable);
        gr.setValue('feed_conditions', primaryActvityFilter);
        gr.setWorkflow(false);
        if (gr.canCreate())
            return gr.insert();

        return false;
    }

    function _createVaDeflectionPattern(dfConfigId, patternId) {
        var gr = new GlideRecord("ssa_deflection_pattern");
        gr.initialize();
        gr.setValue('deflection_configuration', dfConfigId);
        gr.setValue('activity_pattern', patternId);
        gr.setWorkflow(false);
        if (gr.canCreate())
            return gr.insert();

        return false;
    }

    function _updateVaPrimaryActivity(primaryActivityId, primaryActvityTable, primaryActvityFilter) {
        var gr = new GlideRecord("sn_actsub_activity_type");
        if (gr.get(primaryActivityId)) {
            gr.setValue('activity_source_table', primaryActvityTable);
            gr.setValue('feed_conditions', primaryActvityFilter);
            gr.setWorkflow(false);
            if (gr.canWrite())
                return gr.update();
        }
        return false;
    }

    function createVaDeflectionPattern(input) {
        var response = {};
        var dfConfigId = input.deflection_configuration_id;
        var patternName = input.name;

        if (!dfConfigId || !patternName) {
            response.error = gs.getMessage('Required fields missing');
            return JSON.stringify(response);
        }

        // Create Primary activity (optional)
        var primaryActvityTable = input.primary_activity_table;
        var primaryActvityFilter = input.primary_activity_filter;
        var primaryActivityId;
        if (primaryActvityTable || primaryActvityFilter) {
            primaryActivityId = _createVaPrimaryActivity(primaryActvityTable, primaryActvityFilter, patternName);
        }

        // Create Activity Pattern
        var patternOutcome = input.outcome;

        var patternId = _createVaActivityPattern(patternName, patternOutcome, primaryActivityId);
        if (patternId) {
            var dfPatternId = _createVaDeflectionPattern(dfConfigId, patternId);
            if (dfPatternId) {
                response = {
                    'pattern_id': dfPatternId,
                    'success': gs.getMessage('Activity Pattern created')
                };
            }
        } else {
            response.error = gs.getMessage('Activity Pattern creation failed');
        }

        return JSON.stringify(response);
    }

    function updateVaActivityPattern(patternId, patternName, patternOutcome, primaryActvityTable, primaryActvityFilter) {

        var gr = new GlideRecord("ssa_activity_pattern");
        if (patternId && gr.get(patternId)) {
            var primaryActivityId = gr.getValue('primary_activity');

            if (primaryActivityId) {
                primaryActivityId = _updateVaPrimaryActivity(primaryActivityId, primaryActvityTable, primaryActvityFilter);
            } else {
                primaryActivityId = _createVaPrimaryActivity(primaryActvityTable, primaryActvityFilter);
                if (primaryActivityId)
                    gr.setValue('primary_activity', primaryActivityId);
            }

            gr.setValue('name', patternName);
            gr.setValue('outcome', patternOutcome);
            gr.setWorkflow(false);
            if (gr.canWrite()) {
                return gr.update();
            }

        }
        return false;

    }

    var activityPatternId = input.activity_pattern_id;
    if (activityPatternId != '-1') {
        activityPatternId = updateVaActivityPattern(activityPatternId, input.name, input.outcome, input.primary_activity_table, input.primary_activity_filter);
        if (activityPatternId) {
            return {
                'pattern_id': activityPatternId,
                'success': gs.getMessage('Deflection Pattern changes saved succesfully')
            };
        }
        return {
            'error': gs.getMessage('Deflection Pattern creation/updation failed')
        };
    }
    return JSON.parse(JSON.stringify(createVaDeflectionPattern(input)));

}
