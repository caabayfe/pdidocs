var KMFCertScanner = Class.create();

KMFCertScanner.prototype = {
    initialize: function() {
	},

	scan: function() {
		var cu_id = 'c48883b3a3464210ecdb7d69441e610d';
		var description = 'Review the following certificates and consider deprecating them promptly.';
		var gr = new GlideRecord('sn_critical_update');

		if (!gr.isValid() || !gr.get(cu_id))
			throw new Error("Critical update record not found");

		var context = new GlideRecord('sys_pd_context');
		if (!context.isValid())
			throw new Error("sys_pd_context table is invalid.");

		context.addQuery('input_record', cu_id);
		context.query();

		if (context.getRowCount() == 0) {
			// Under some scenario, our data isn't auto populated on a fresh DB. Reactivating will force generate
			gs.warn("KMFCertScanner detected no record in sys_pd_context, attempting to reactivate..");
			gr.setValue("up_active", false);
			gr.update();
			gr.setValue("up_active", true);
			gr.update();

			context.initialize();
			context.addQuery('input_record', cu_id);
			context.query();
		}

		if (context.getRowCount() != 1) {
			gs.error("KMFCertScanner could not find the critical update record in sys_pd_context");
			return;
		}

		context.next();
		var activityContext = new GlideRecord('sys_pd_activity_context');

		if (!activityContext.isValid())
			throw new Error("sys_pd_activity_context table is invalid.");

		activityContext.addQuery('context', context.sys_id);
		activityContext.addQuery('name', 'critical_update_activity');
		activityContext.query();

		if (activityContext.getRowCount() != 1) {
			gs.error("KMFCertScanner could not find the critical update record in sys_pd_activity_context");
			return;
		}

		activityContext.next();
		var variable = new GlideRecord('sys_variable_value');

		if (!variable.isValid())
			throw new Error("sys_variable_value table is invalid.");

		variable.addEncodedQuery('document=sys_pd_activity_context^document_key=' + activityContext.sys_id + '^variable.label=Description^valueSTARTSWITH' + description, true);
		variable.query();

		if (variable.getRowCount() != 1) {
			gs.error("KMFCertScanner could not find the description record in sys_variable_value table");
			return;
		}

		variable.next();
		var newValue = description + '<p>' + new sn_kmf_ns.KMFUnsafeCertificateScanner().execute();
		var oldValue = variable.getValue('value');

		// If the value has changed, change all reference points.
		if (oldValue !== newValue) {
			variable.setValue('value', newValue);
			variable.update();
			gs.debug("KMFCertScanner updated the description value in DB. Old - " + oldValue + " / New - " + newValue);

			if (activityContext.experience_properties && activityContext.experience_properties.trim()) {
				try {
					var exp = JSON.parse(activityContext.experience_properties);

					if (exp && Array.isArray(exp) && exp.length > 0) {
						var target = exp.find(item =>
						item.name === "description" &&
						item.value &&
						item.value.startsWith(description)
						);

						if (target) {
							var oldValue = target.value;
							target.value = newValue;
							activityContext.experience_properties.setValue(JSON.stringify(exp));
							activityContext.update();
							gs.debug("KMFCertScanner successfully updated experience_properties field. Old - " + oldValue + " / New - " + newValue);
						} else {
							gs.debug("KMFCertScanner did not update experience_properties as the description field was not detected");
						}
					}
				} catch (e) {
					gs.error("KMFCertScanner detected presence of experience_properties field but could not process due to reason: " + e);
				}
			}

			// Only reactivate critical update if it detected changes.
			gr.setValue("up_active", false);
			gr.update();
			gr.setValue("up_active", true);
			gr.update();
		}
    },

    type: 'KMFCertScanner'
};
