var ITOMTriggerLicensableCIsReport = Class.create();
ITOMTriggerLicensableCIsReport.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	initReports: function(){
		var sysIdsList = JSON.parse(this.getParameter('sysparm_selValueStreams'));

		if (gs.nil(sysIdsList))
			return "Nothing to process!";

		var counter = this._triggerJobs(sysIdsList);
		var noOfSelectedVS = sysIdsList.split(",").length;
		return counter == noOfSelectedVS;
	},

	isListingJobRunning : function() {
		var sysIdsList = JSON.parse(this.getParameter('sysparm_selValueStreams'));
		return new sn_itom_license.ITOMLicensingUtils().isListingJobRunning(sysIdsList);
	},

	cancelListingJobs : function() {
		var sysIdsList = JSON.parse(this.getParameter('sysparm_selValueStreams'));
		var gr = new GlideRecord('itom_lu_licensable_cis_trigger');
		gr.addQuery('sys_id', 'IN', sysIdsList);
		gr.query();
		while(gr.next() && gr.canWrite()) {
			gr.setValue('is_cancel','true');
			gr.update();
		}
	},

	_triggerJobs: function(sysIdsList){
		var counter = 0;
		var itomLicCIsReportGR = new GlideRecord('itom_lu_licensable_cis_trigger');
		itomLicCIsReportGR.addQuery('sys_id', 'IN', sysIdsList);
		itomLicCIsReportGR.query();

		while (itomLicCIsReportGR.next() && itomLicCIsReportGR.canWrite()){
			var scheduledJobGR = new GlideRecord('sysauto_script');
			var isRecPresent = scheduledJobGR.get('sys_id', itomLicCIsReportGR.getValue('executable_script'));
			var jobSysId;

			if (isRecPresent)
				jobSysId = gs.executeNow(scheduledJobGR);

			if (!gs.nil(jobSysId)) {
				counter++;
				itomLicCIsReportGR.setValue('status','running');
			}
			else {
				gs.info(gs.getMessage("Error: Unable to schedule job for {0}", itomLicCIsReportGR.getValue('value_stream')));
				itomLicCIsReportGR.setValue('status','failed');
			}

			var values = [jobSysId, itomLicCIsReportGR.getValue('value_stream')];
			gs.info(gs.getMessage("Job ID for value stream {1} is {0}.", values));
			itomLicCIsReportGR.update();
		}
		

		return counter;
	},

	type: 'ITOMTriggerLicensableCIsReport'
});
