
			var hasBMAccess = gs.hasRole('sn_bm_client.benchmark_data_viewer');
answer = new sn_par_intelligence.InsightACLUtilScriptable(current.uuid).canReadInsight() && hasBMAccess;
