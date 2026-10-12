var ExperimentUIService = Class.create();
ExperimentUIService.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    type: 'ExperimentUIService',
    ajaxFunction_disableExperimentation: function() {
        try {
            var proxy = new global.ExperimentationPropertyManager();
            var result = proxy.setExperimentationDisabled(true);
            return result;
        } catch (e) {
            gs.error('[ExperimentUIService] Error disabling experimentation: ' + e.message);
            return 'error';
        }
    },
    
    ajaxFunction_enableExperimentation: function() {
        try {
            var proxy = new global.ExperimentationPropertyManager();
            var result = proxy.setExperimentationDisabled(false);
    
            if (result === 'success') {
                this.oneTimeCDSScheduler();
            }
            return result;
        } catch (e) {
            gs.error('[ExperimentUIService] Error enabling experimentation: ' + e.message);
            return 'error';
        }
    },

    oneTimeCDSScheduler: function() {

        var triggerName = "Experimentation Service -oneTimeCDSScheduler";
        var scriptContent =
          "var record = new GlideRecord('cds_client_schedule');" +
          "if (!record.isValid()) {" +
          "  gs.info('Experimentation Service: cds_client_schedule: check table cds_client_schedule. failed abort');" +
          "} else {" +
          "  if (record.get('21274286ff403210eba0ffffffffff30')) {" +
          "    gs.executeNow(record);" +
          "  } else {" +
          "    gs.info('Fix Experimentation cds_client_schedule: Failed to retrieve the record');" +
          "  }" +
          "}";
 
        try {
          var scheduler = new global.ExperimentCDSGlobalScheduler();
          var triggerId = scheduler.oneTimeCDSScheduler(triggerName, scriptContent);
            if (triggerId) {
                gs.info('Trigger created successfully with ID: ' + triggerId);
            } else {
                gs.error('Failed to schedule trigger');
             }
         } catch (e) {
           gs.error('Error creating trigger - ' + e.message);
        }
 
     },



});
