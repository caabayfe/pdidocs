var VADeflectionAjaxUtil = Class.create();
VADeflectionAjaxUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    VA_DEFAULT_ACVITY_CONTEXT: "7b43fb645383201033cdddeeff7b1246",
    createVaDeflectionConfig: function() {
        var response = {};
        var dfConfigName = this.getParameter('sysparm_config_name');
        var dfConfigDesc = this.getParameter('sysparm_config_desc');

        if (!dfConfigName) {
            response.error = gs.getMessage('Required fields missing');
            return JSON.stringify(response);
        }
        // Create Deflection Configuration
        var gr = new GlideRecordSecure("ssa_deflection_configuration");
        gr.initialize();
        gr.setValue('name', dfConfigName);
        gr.setValue('description', dfConfigName);
        gr.setValue('activity_context', this.VA_DEFAULT_ACVITY_CONTEXT);
        gr.setWorkflow(false);
        if (gr.canCreate() && gr.insert()) {
            response.success = gs.getMessage('Deflection Configuration created');
        } else {
            response.error = gs.getMessage('VA Deflection Config creation Failed');
        }
        return JSON.stringify(response);
    },

    createVaDeflectionPattern: function() {
        var response = {};
        var dfConfigId = this.getParameter('sysparm_df_config');
        var patternName = this.getParameter('sysparm_pattern_name');

        if (!dfConfigId || !patternName) {
            response.error = gs.getMessage('Required fields missing');
            return JSON.stringify(response);
        }

        // Create Primary activity (optional)
        var primaryActvityTable = this.getParameter('sysparm_activity_table');
        var primaryActvityFilter = this.getParameter('sysparm_activity_filter');
        var primaryActivityId;
        if (primaryActvityTable || primaryActvityFilter) {
            primaryActivityId = this._createVaPrimaryActivity(primaryActvityTable, primaryActvityFilter, patternName);
        }

        // Create Activity Pattern
        var patternDesc = this.getParameter('sysparm_pattern_desc');
        var patternOutcome = this.getParameter('sysparm_pattern_outcome');

        var patternId = this._createVaActivityPattern(patternName, patternDesc, patternOutcome, primaryActivityId);
        if (patternId) {
            var dfPatternId = this._createVaDeflectionPattern(dfConfigId, patternId);
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
    },

    _createVaDeflectionPattern: function(dfConfigId, patternId) {
        var gr = new GlideRecordSecure("ssa_deflection_pattern");
        gr.initialize();
        gr.setValue('deflection_configuration', dfConfigId);
        gr.setValue('activity_pattern', patternId);
        gr.setWorkflow(false);
        if (gr.canCreate())
            return gr.insert();

        return false;
    },


    _createVaActivityPattern: function(name, description, outcome, primaryActivityId) {
        var gr = new GlideRecordSecure("ssa_activity_pattern");
        gr.initialize();
        gr.setValue('name', name);
        gr.setValue('description', description || '');
        if (outcome)
            gr.setValue('outcome', outcome);
        if (primaryActivityId)
            gr.setValue('primary_activity', primaryActivityId);

        gr.setWorkflow(false);
        if (gr.canCreate())
            return gr.insert();

        return false;
    },

    _createVaPrimaryActivity: function(primaryActvityTable, primaryActvityFilter, shortDescription) {
        var gr = new GlideRecordSecure("sn_actsub_activity_type");
        gr.initialize();
        gr.setValue('activity_source_table', primaryActvityTable);
        gr.setValue('feed_conditions', primaryActvityFilter);
        gr.setValue('short_description', shortDescription);
        gr.setWorkflow(false);
        if (gr.canCreate())
            return gr.insert();

        return false;
    },

    updateVaActivityPattern: function() {
        var response = {};
        var patternId = this.getParameter('sysparm_pattern_id');
        var gr = new GlideRecordSecure("ssa_activity_pattern");

        if (patternId && gr.get(patternId)) {
            var patternName = this.getParameter('sysparm_pattern_name');
            var patternDesc = this.getParameter('sysparm_pattern_desc');
            var patternOutcome = this.getParameter('sysparm_pattern_outcome');
            var primaryActvityTable = this.getParameter('sysparm_activity_table');
            var primaryActvityFilter = this.getParameter('sysparm_activity_filter');

            var primaryActivityId = gr.getValue('primary_activity');

            if (primaryActivityId) {
                primaryActivityId = this._updateVaPrimaryActivity(primaryActivityId, primaryActvityTable, primaryActvityFilter);
            } else {
                primaryActivityId = this._createVaPrimaryActivity(primaryActvityTable, primaryActvityFilter, patternDesc);
                if (primaryActivityId)
                    gr.setValue('primary_activity', primaryActivityId);
            }

            gr.setValue('name', patternName);
            gr.setValue('description', patternDesc || '');
            gr.setValue('outcome', patternOutcome);
            gr.setWorkflow(false);
            if (gr.canWrite() && gr.update()) {
                response = {
                    'pattern_id': patternId,
                    'success': gs.getMessage('Activity Pattern updated')
                };
            }

        } else {
            response.error = gs.getMessage('No record found');
        }

        return JSON.stringify(response);
    },

    _updateVaPrimaryActivity: function(primaryActivityId, primaryActvityTable, primaryActvityFilter) {
        var gr = new GlideRecordSecure("sn_actsub_activity_type");
        if (gr.get(primaryActivityId)) {
            gr.setValue('activity_source_table', primaryActvityTable);
            gr.setValue('feed_conditions', primaryActvityFilter);
            gr.setWorkflow(false);
            if (gr.canWrite())
                return gr.update();
        }

        return false;
    },

    type: 'VADeflectionAjaxUtil'
});
