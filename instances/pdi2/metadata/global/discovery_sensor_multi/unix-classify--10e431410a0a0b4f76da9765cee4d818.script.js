new DiscoveryMultiSensor({
    //
    // this sensor uses the common script include class "DiscoveryMultiSensor"
    //

    finish: function() {
        this.ci_data = this.ciData.getData();
        this.discover = this.getParameter('discover');

        // If the output combined from all the scripts are empty, then we have nothing to process here.
        if (StringUtil.nil(this.ci_data.output) || this.ci_data.output == undefined)
            return;

        // If we shouldn't trigger probes don't attempt this classification.
        // (DiscoverySensor calls setTriggerProbes(false) if the probe result has any errors)
        // Any remaining classifiers for other open ports will still be launched if applicable.
        if ('' + this.ASensor.isTriggerProbes() == 'false')
            return;

        this.classify();
    },

    classify: function() {
        var values = {};
        values['name'] = this.ci_data.os_name;
        values['output'] = this.ci_data.output;
        values['type'] = 'unix';
        values['ip_address'] = this.ci_data.ip_address;
        values['discover'] = this.discover;
        values['bigip'] = this.ci_data.classify_params.bigip;

        // for Solaris, check if version is 5.11 or higher
        if ("SOLARIS".equals(this.getOSType(this.ci_data.os_name))) {
            var version = this.ci_data.os_version.split(/\./);
            if (version.length >= 2)
                this.ci_data['solaris11'] = version[0] > 5 || (version[0] == 5 && version[1] > 10);
        }

        var statusId = this.getAgentCorrelator();
        var gr = new GlideRecord("discovery_status");
        if (statusId)
            gr.get('sys_id', statusId);
        values['discovery_source'] = "" + gr.source;

        if (values['bigip']) {
            var F5DiscoveryMsg = gs.getMessage("Unix Classification is being aborted. F5 SNMP classification will be launched");
            DiscoveryLogger.info(F5DiscoveryMsg, 'UNIX Classify', this.getEccQueueId());
            this.fireAdditionalClassifier();
            return;
        }

        for (var name in this.ci_data.classify_params)
            values[name] = this.ci_data.classify_params[name];

        //Deleting this because it's only meant for classifying data.
        delete this.ci_data.classify_params;

        //Now add the rest of the CI data attribute into values.
        this.addCIDataBaseValue(values);

        var dClass = new DiscoveryClassification(this.getEccQueueRecord());

        // if we didn't find the OS type, bail out and do the right thing...
        if (!dClass.find(use_class, values)) {
            if (g_device)
                g_device.changeDeviceState("rejected");

            this.fireAdditionalClassifier();
            return;
        }

        var classifier = dClass.getClassificationRecord();
        if (this.classifierIsDisabled(classifier)) {
            this.handleDisabledClassifier(classifier, 'UNIX Classify');
            return;
        }

        this.ci_data['sys_class_name'] = dClass.getClassificationTable();
        if (g_device)
            g_device.setClassifiedAs(dClass.getClassificationTable());

        //If we're linux, we want what came back from uname to be the kernel_release
        // instead of os_version
        if (this.ci_data.sys_class_name == "cmdb_ci_linux_server") {
            this.ci_data.kernel_release = '' + this.ci_data.os_version;
            delete this.ci_data.os_version; //so we don't update os_version
        }

        // run classify script box and set the CI data if applicable
        this.runClassificationScript(dClass, this.ci_data);

        var hm = new Packages.java.util.HashMap();
        hm.put('port', this.getParameter('port'));
        hm.put('port_probe', this.getParameter('port_probe'));
        hm.put('cidata', this.ciData.toXML());
        hm.put('triggered_probes', '' + dClass.getTriggeredProbesAsString('exploration'));
        hm.put('classifiers', this.getParameter('classifiers'));
        hm.put('is_supplementary', this.getParameter('is_supplementary'));
        hm.put('os_type', this.getOSType(this.ci_data.os_name)); // added for pipeline
        hm.put('protocol', "SSH"); // added for pipeline
        hm.put('mid_selector_details', this.getParameter('mid_selector_details'));

        if (this.getParameter('ssm_object'))
            hm.put('ssm_object', this.getParameter('ssm_object'));

        var identification = '' + dClass.getTriggeredProbesAsString('identification');
        if (JSUtil.nil(identification)) {
            if (g_device && !(values['esx']))
				DiscoveryErrorsUtilities.addError('SN-1584', 'No Identification phase defined for UNIX');
        }

        dClass.triggerProbes(this.getEccQueueId(), hm, 'identification');

        // if we are ESX, then log that discovery is supported through vCenter
        var currentActivity = 'Identifying';
        if (values['esx']) {
            var vCenterMsg = gs.getMessage("ESX discovery is only supported through the vCenter probe");
            DiscoveryLogger.info(vCenterMsg, 'UNIX Classify', this.getEccQueueId());
            currentActivity = '';
        }

        // update device history state, if we have one...
        if (g_device) {
            var status = new DiscoveryStatus(g_device.getStatus());
            g_device.state('Classified', currentActivity, status.logStateChanges, 'UNIX Classify', this.getEccQueueId());
        }
    },

    getOSType: function(os_name) {
        if ("AIX".equals(os_name))
            return "AIX";

        if ("Darwin".equals(os_name))
            return "OSX";

        if ("SunOS".equals(os_name))
            return "SOLARIS";

        if (JSUtil.notNil(os_name) && os_name.indexOf("HP-UX") > -1)
            return "HPUX";

        return "LINUX";
    },

    handleError: function(errors) {
        var lastState = null;
        for (var i = 0; i < errors.length && lastState === null; ++i) {
            var error = errors[i];
            var msg = typeof error === 'object' && error.hasOwnProperty('msg') ? error.msg : error;
            if (msg.indexOf('SSH Authentication or connection failure') !== -1)
                lastState = DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY + ': Can\'t connect SSH';
        }

        if (lastState === null) {
            lastState = DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY;
        }

        DiscoverySensor.prototype.handleError.call(this, errors, {
            sourceName: 'UNIX Classify',
            lastState: lastState,
            deviceState: DiscoverySensor.DeviceStates.REJECTED,
            fireClassifiers: true
        });
    },

    type: "DiscoveryMultiSensor"
});
