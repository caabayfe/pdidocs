var EvtMgmtSyncTBGroupingAndMLSolState = Class.create();
EvtMgmtSyncTBGroupingAndMLSolState.prototype = {
    initialize: function() {
			this.synchronize();
    },
	
	synchronize: function(){
		var textBasedState = gs.getProperty('sa_analytics.text_based_group_enabled', 'true');
		var solutionName = gs.getProperty('sa_analytics.ml.solution_name', 'ml_sn_global_global_em_alert_clustering_solution');
		var solutionDefGr = new GlideRecord('ml_capability_definition_clustering');
        solutionDefGr.addQuery('solution_name', solutionName);
        solutionDefGr.query();
        if (solutionDefGr.next()) {
            var solutionDefState = String(solutionDefGr.getValue('active') == '1');
			// Sync the solution definition state to the text-based state
            if (textBasedState != solutionDefState) {
                solutionDefGr.setValue('active', textBasedState);
                solutionDefGr.update();
                if (textBasedState == 'true') {
					gs.info(this.type +" script include: called EvtMgmtAutoTrainer script include.");
                    new EvtMgmtAutoTrainer().train(); // auto train Event Management solutions
                }
            }
        } else {
            gs.error(this.type + ' script include: Event management alert clustering solution ' + solutionName + ' not found');
        }
	},


    type: 'EvtMgmtSyncTBGroupingAndMLSolState'
};
