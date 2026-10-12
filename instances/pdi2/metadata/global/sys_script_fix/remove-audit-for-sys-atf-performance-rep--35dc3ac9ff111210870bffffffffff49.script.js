var tablesList = ["sys_atf_performance_repetitive_timeout"];
		disableAudit();

		function disableAudit() {
		gs.info("Executing PI fix script: Reduce audit footprint " + tablesList);
		var gr = new GlideRecord('sys_dictionary');
		gr.addQuery('name', 'IN', tablesList);
		gr.addQuery('internal_type', 'collection');
		gr.addQuery("audit", true);

		gr.setValue("audit", false);
		gr.updateMultiple();
		}
