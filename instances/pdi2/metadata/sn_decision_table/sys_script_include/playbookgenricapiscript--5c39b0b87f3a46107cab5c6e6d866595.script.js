var PlaybookGenricAPIScript = Class.create();
PlaybookGenricAPIScript.prototype = {
    initialize: function() {

    },

    /**
     * Retrive playbook detials from sys_pd_process_definition
     */
    getPlayBookDetails: function(pdActivitySysId) {
        var results = [];
        var playbookDefinitionGlideRecord = new GlideRecord("sys_pd_process_definition");
        playbookDefinitionGlideRecord.addQuery("sys_id", pdActivitySysId);
        playbookDefinitionGlideRecord.query();
        while (playbookDefinitionGlideRecord.next()) {
            var playbook = {};
            playbook.sys_id = playbookDefinitionGlideRecord.getValue("sys_id");
            playbook.name = playbookDefinitionGlideRecord.getValue("label");
            playbook.active = playbookDefinitionGlideRecord.getValue("active");
            playbook.status = playbookDefinitionGlideRecord.getValue("status");
            playbook.type = "playbook";
            playbook.canread = playbookDefinitionGlideRecord.canRead();
            return playbook;
        }

    },

    /**
     * Retrive playbook refernce for particular decision table from sys_pd_activity.
     */
	
    getPlayBookReferncesForDecisionTableBySysId: function(decisionTableSysId) {
        var playbookResults = [];
        var playbookSysIdCache = [];
        var playbookActivityGlideRecord = new GlideRecord('sys_pd_activity');
        playbookActivityGlideRecord.query();
        while (playbookActivityGlideRecord.next()) {
            var playbookInputsDecisionTableSysId = playbookActivityGlideRecord.getDisplayValue("inputs.decision_table.sys_id");

            /**
             * Comparing decision table sys_id and playbook activity sys_id,
             * If both are equal store in playbookResults
             */
            if (playbookInputsDecisionTableSysId == decisionTableSysId) {
                var sys_id = playbookActivityGlideRecord.getDisplayValue("process_definition.sys_id");
                var playbook = this.getPlayBookDetails(sys_id);

                /**
                 * Eliminating duplicate activity records 
                 */
                if (playbookSysIdCache.indexOf(playbook.sys_id) == -1) {
                    if (playbook.canread) {
                        playbookResults.push(playbook);
                    } else {
						/**
						 * Only keep canrad and type if user don't have access to playbook
						 */
                        playbookResults.push({
                            canread: playbook.canread,
                            type: playbook.type
                        });
                    }

                    playbookSysIdCache.push(playbook.sys_id);

                }
            }

        }
        return playbookResults;
    },
    type: 'PlaybookGenricAPIScript'
};
