
		(function processEvent(event) {
			var params = event.getValue('parm1').split(';');

			if(params.length > 1) {
				deleteKpiFromFinding('promin_finding_def', params[0]);
				deleteKpiFromFinding('promin_automated_finding', params[0]);
			}
		})(event);


		function deleteKpiFromFinding(tableName, kpiToDelete) {
			var findingGr = new GlideRecord(tableName);
			findingGr.addQuery('impacted_kpis', 'CONTAINS', kpiToDelete);
			findingGr.query();

			while(findingGr.next()) {
				var impactedKpis = findingGr.getValue('impacted_kpis');
				var items = impactedKpis.split(',');

				items = items.filter(item => item != kpiToDelete);

				findingGr.setValue('impacted_kpis', items.join(','));
				findingGr.update();
			}
		}
		
