
         gs.info("Started running fix script to set default analytics consent policy.");

        var gr = new GlideRecord("core_country");
        gr.addQuery("sys_updated_by", "NOT IN", ["system", "admin", "maint"]);
        gr.addReturnField("sys_id");
        gr.query();
        var customizedSysIds = [];
        while (gr.next()) {
            customizedSysIds.push(gr.getValue('sys_id'));
        }

        if (customizedSysIds.length === 0) {
            gs.info("Customer has not customized any Analytics Consent Policy in core_country table.");
        } else {
            gs.info("Customer has customized Analytics Consent Policy for "+GlideStringUtil.join(customizedSysIds)+" sysId's from core_country table, so while upgrade this record's will not changed to default consent policy.");
        }

        //Update country record to No Consent Required if there are not customized
        var grNoConsentRequiredPolicy = new GlideRecord("core_country");

        if(customizedSysIds.length > 0) {
	      grNoConsentRequiredPolicy.addQuery("sys_id","NOT IN",GlideStringUtil.join(customizedSysIds));
        }
        grNoConsentRequiredPolicy.setValue("analytics_consent_policy", "ef0bb519773311105679bcc8ca5a99ad");//No Consent Required
        grNoConsentRequiredPolicy.updateMultiple();

		gs.info("Finished running fix script to set default analytics consent policy.");
