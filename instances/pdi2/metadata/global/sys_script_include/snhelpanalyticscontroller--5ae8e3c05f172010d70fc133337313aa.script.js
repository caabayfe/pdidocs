var SNHelpAnalyticsController = Class.create();

SNHelpAnalyticsController.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    CATEGORY: 'custom_metric',
    ADS_CATEGORY: 'adoption_services',
    ADS_POINTS: {
        helpCentre: 'help_centre',
        helpModal: 'help_modal'
    },
    POINT: 'adoption_services',
    EVENTS: {
        setup: {
            newRecord: 'guidance_new_record',
            usageFrequency: 'setup_usage_frequency'
        },
        panel: {
            feedback: 'help_panel_feedback'
        },
        // Instrumentation event to capture payload when guidance type is embedded help.
        help_centre: {
            newRecord: 'new_record',
            addHelpLinkClicked: 'new_record_using_link'
        },
        // Instrumentation event for modal completion event.
        modal: {
            complete: "modal_completion"
        }
    },

    logDatafromClient: function() {
        var event = this.getParameter('sysparm_event').toString();
        var category = this.getParameter('sysparm_category');
        var point = this.getParameter('sysparm_point');
        var data = JSON.parse(this.getParameter('sysparm_data'));
        this.logData(category, point, event, data);
    },

    logData: function(category, point, event, data) {

        if (!data) {
            gs.log("SNHelpAnalyticsController: Data has not been provided");
            return;
        }

        if (event === this.EVENTS.setup.newRecord) {
            var sm = new GCFSampleMap();
            sm.put('type', data.type || '');
            sm.put('name', data.name || '');
            sm.put('sys_package', data.sys_package || '');
            sm.put('sys_scope', data.sys_scope || '');
            sm.put('roles', data.roles || '');
            sm.put('status', data.status || '');
            sm.put('setup_execution_type', data.setup_execution_type || '');
            GCFCollector.recordUsageEvent(category, point, event, sm);
        } else if (event === this.EVENTS.setup.usageFrequency) {
            var freqData = new GCFSampleMap();
            freqData.put('name', data.name || '');
            freqData.put('type', data.type || '');
            freqData.put('roles', data.roles || '');
            freqData.put('sys_scope', data.sys_scope || '');
            freqData.put('sys_package', data.sys_package || '');
            freqData.put('setup_execution_type', data.setup_execution_type || '');
            GCFCollector.recordUsageEvent(category, point, event, freqData);
        } else if (event === this.EVENTS.panel.feedback) {
            var feedbackData = new GCFSampleMap();
            feedbackData.put('feedback', data.feedback);
            feedbackData.put('topicId', data.topicId);
            GCFCollector.recordUsageEvent(category, point, event, feedbackData);
        } else if (event == this.EVENTS.help_centre.newRecord) {
            var sample = new GCFSampleMap();
            sample.put('name', data.name || '');
            sample.put('sys_package', data.sys_package || '');
            sample.put('sys_scope', data.sys_scope || '');
            sample.put('context', data.context || '');
            sample.put('application_route', data.application_route || '');
            sample.put('route_params', data.route_params || '');
            sample.put('snc_created', data.snc_created || '');
            GCFCollector.recordUsageEvent(category, point, event, sample);
        } else if (event === this.EVENTS.modal.complete) {
            var payload = new GCFSampleMap();
            payload.put('name', data.name || '');
            payload.put('snc_created', data.snc_created || '');
            payload.put('sys_scope', data.sys_scope || '');
            payload.put('sys_package', data.sys_package || '');
            GCFCollector.recordUsageEvent(category, point, event, payload);
        } else if (event == this.EVENTS.help_centre.addHelpLinkClicked) {
            var captureData = new GCFSampleMap();
            captureData.put('context', data.context || '');
            captureData.put('application_route', data.application_route || '');
            captureData.put('sys_scope', data.sys_scope || '');
            captureData.put('status', data.status || '');
            GCFCollector.recordUsageEvent(category, point, event, captureData);
        }

    },

    type: 'SNHelpAnalyticsController'
});
