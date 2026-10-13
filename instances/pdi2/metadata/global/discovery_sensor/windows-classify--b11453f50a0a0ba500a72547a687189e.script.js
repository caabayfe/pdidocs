new DiscoveryWindowsClusterBaseSensor({
    process: function(result) {
        var wmiData;

        if (this.isJsonUsed()) {
            // The output is JSON
            try {
                result = JSON.parse(result.output);
            } catch (e) {
                gs.error("Could not parse payload as JSON, payload: " + JSON.stringify(result));
                return;
            }

            if (result.wmi)
                wmiData = result.wmi;
            else {
                DiscoveryLogger.warn('Classification payload is empty. Stopping classification.', 'Discovery Sensor', this.getEccQueueId(), null);
                return;
            }
        } else {
            // The output is XL
            wmiData = result;
        }

        this.values = {};
        this.osHostname = null;
        this.domainName = null;
        this.ciData = new CIData();
        this.ciData.fromXML(this.getParameter('cidata'));
        this.ci_data = this.ciData.getData();

        // first parse any cluster information we got...
        this.findClusters(wmiData);
        this.findNodes(wmiData);
        this.findResources(wmiData);
        this.associateClustersToNodes(wmiData);
        this.associateClustersToResources(wmiData);
        this.values['isVIP'] = new Boolean(this.isVIP).toString();

        /*
         * if this is a VIP, we're going to classify as a cluster; otherwise, it's a Windows box...
         * note that Windows clusters MAY be configured such that VIPs don't have NetBIOS ports open,
         * in which case we'll never get here on a VIP.  For that reason, we can't rely on a VIP to
         * let us explore a Windows cluster...
         */
        if (this.isVIP)
            this.handleWindowsCluster(wmiData);
        else
            this.handleWindowsComputer(result);

        if (g_device)
            g_device.markScanned(g_probe.getParameter('port_probe'));
    },

    handleWindowsCluster: function(result) {
        if (!g_device)
            return;

        var status = new DiscoveryStatus(agent_correlator);
        g_device.state('Active, Windows Cluster VIP', '', status.logStateChanges, 'Windows Classify', this.getEccQueueId());
    },

    handleWindowsComputer: function(result) {
        var wmiData;
        if (this.isJsonUsed()) {
            wmiData = result.wmi;
        } else {
            wmiData = result;
        }
        this.setBasicWindows(result);
        this.handleHostname();
        this.handleDomainName();
        this.checkForClusterNode(wmiData);
        this.classify();
        // provide messages in discovery log and device history if we don't have the caption info
        if (JSUtil.nil(wmiData.Win32_OperatingSystem.Caption))
            this.processError("Missing Classification Information");
    },

    classify: function() {
        var sysClassName = "cmdb_ci_computer";

        this.addCIDataBaseValue(this.values);
        var dClass = new DiscoveryClassification(this.getEccQueueRecord());

        if (!dClass.find(use_class, this.values)) {
            if (g_device)
                g_device.changeDeviceState("rejected");

            this.fireAdditionalClassifier();
            return;
        }

        var classifier = dClass.getClassificationRecord();
        if (this.classifierIsDisabled(classifier)) {
            this.handleDisabledClassifier(classifier, 'Windows Classify');
            return;
        }

        sysClassName = dClass.getClassificationTable();
        if (g_device)
            g_device.setClassifiedAs(dClass.getClassificationTable());

        // run classify script box and set the CI data if applicable
        this.runClassificationScript(dClass, this.ci_data);

        this.ci_data['sys_class_name'] = sysClassName;
        var hm = new Packages.java.util.HashMap();
        this.getVIPs(hm);
        hm.put('port', this.getParameter('port'));
        hm.put('port_probe', this.getParameter('port_probe'));
        hm.put('cidata', this.ciData.toXML());
        hm.put('triggered_probes', '' + dClass.getTriggeredProbesAsString('exploration'));
        hm.put('classifiers', this.getParameter('classifiers'));
        hm.put('is_supplementary', this.getParameter('is_supplementary'));
        hm.put('os_type', 'WINDOWS'); // added for pipeline
        hm.put('protocol', 'WMI'); // added for pipeline
        hm.put('mid_selector_details', this.getParameter('mid_selector_details'));

        if (this.getParameter('ssm_object'))
            hm.put('ssm_object', this.getParameter('ssm_object'));

        var identification = '' + dClass.getTriggeredProbesAsString('identification');
        if (JSUtil.nil(identification)) {
            if (g_device)
				DiscoveryErrorsUtilities.addError('SN-1584', 'No Identification phase defined for Windows');
        }
        dClass.triggerProbes(this.getEccQueueId(), hm, 'identification');

        // update device history state, if we have one...
        if (g_device) {
            var status = new DiscoveryStatus(g_device.getStatus());
            g_device.state('Classified', 'Identifying', status.logStateChanges, 'Windows Classify', this.getEccQueueId());
        }
    },

    handleHostname: function() {
        this.values['hostname'] = this.ci_data.name;
        var haveNow = !JSUtil.nil(this.ci_data['name']);
        var haveNew = !JSUtil.nil(this.osHostname);
        var trusted = JSUtil.toBoolean(gs.getProperty("glide.discovery.hostname.wmi_trusted", "false"));
        if (!haveNew)
            return;

        if (haveNow && !trusted)
            return;

        this.ci_data['name'] = this.osHostname;
        this.values['hostname'] = this.ci_data.name;
    },

    handleDomainName: function() {
        if (!JSUtil.toBoolean(gs.getProperty("glide.discovery.domain.name.nbt", "true")))
            this.ci_data['os_domain'] = this.domainName;
    },

    setBasicWindows: function(result) {
        var longHostName;
        var domainName2;
        var wmiData;
        if (this.isJsonUsed()) {
            longHostName = result.registry[0].Hostname;
            domainName2 = result.registry[0].Domain;
            wmiData = result.wmi;
        } else {
            var hostNameRegKey = "HKEY_LOCAL_MACHINE.SYSTEM.CurrentControlSet.Services.Tcpip.Parameters";
            var node = g_disco_functions.findRegistryNode(result.Registry, hostNameRegKey);
            longHostName = g_disco_functions.findNodeValueWithAttribute(node, "Hostname");
            domainName2 = g_disco_functions.findNodeValueWithAttribute(node, "Domain"); //how puppet gets it
            wmiData = result;
        }
        var hostName = JSUtil.notNil(longHostName) ? longHostName : this.primStr(wmiData.Win32_ComputerSystem.Name);

        // if WMI is trusted for the domain name, then use it in the FQDN, otherwise use the domain name from Shazzam
        var wmi_trusted = JSUtil.toBoolean(gs.getProperty("glide.discovery.hostname.wmi_trusted", "false"));
        var dns_trusted = JSUtil.toBoolean(gs.getProperty("glide.discovery.hostname.dns_nbt_trusted", "false"));
        if (wmi_trusted && JSUtil.notNil(hostName) && JSUtil.notNil(domainName2))
            this.ci_data['fqdn'] = hostName + "." + domainName2;
        else if (dns_trusted && JSUtil.notNil(this.ci_data['dns_domain']))
            this.ci_data['fqdn'] = this.ci_data['name'];
        else if (JSUtil.notNil(this.ci_data['dns_name']))
            this.ci_data['fqdn'] = this.ci_data['dns_name'];
        else
            this.ci_data['fqdn'] = hostName;

        // Now set 'host_name' field in ci_data
        if (typeof hostName == 'object') { // handle case where hostName looks like this: {"#text":"cvgwprlws04","@type":"1"}
            if (hostName == null)
                this.ci_data['host_name'] = this.ci_data['name'];
            else
                this.ci_data['host_name'] = hostName['#text'];
        } else
            this.ci_data['host_name'] = hostName; // Set the host_name field to the actual wmi hostname. This way servers will always have it.

        var hnJS = new HostnameJS();
        this.ci_data['host_name'] = hnJS.format(this.ci_data['host_name']);

        var hn = new HostnameJS();
        hn.setLogger(this.getLogger());
        if (JSUtil.notNil(this.ci_data['fqdn']))
            hostName = this.ci_data['fqdn']; // pass in FQDN to HostNameJS if either WMI or DNS is a trusted source
        this.osHostname = hn.format(hostName);

        var osName = new WindowsOSNameHelper().formatWindowsOSName(wmiData.Win32_OperatingSystem.Caption);
        this.ci_data.os = new String(osName);
        this.domainName = wmiData.Win32_ComputerSystem.Domain;
        this.values['name'] = this.ci_data.os;
        this.values['osFullName'] = wmiData.Win32_OperatingSystem.Caption;
        this.values['type'] = 'windows';
        this.values['ip_address'] = this.getSource();
        this.values['runner_type'] = '' + this.getParameter('runner_type');
        this.values['isHyperV'] = '' + (g_array_util.ensureArray(wmiData.Msvm_ComputerSystem).length > 0);
        this.values['osVersion'] = wmiData.Win32_OperatingSystem.Version;
    },

    checkForClusterNode: function(result) {
        this.values['isNode'] = 'false';
        if (gs.nil(this.ci_data['host_name']))
            return;

        var hostname = this.ci_data['host_name'].toLowerCase();
        for (var nodeName in this.nodes) {
            if (nodeName.toLowerCase() == hostname) {
                this.values['isNode'] = 'true';
                break;
            }
        }
    },

    getVIPs: function(parametersHashMap) {
        var vips = '';
        for (var clusterName in this.clusters) {
            var cluster = this.clusters[clusterName];
            for (var i = 0; i < cluster.cmdb_ci_cluster_vip.length; i++) {
                var vip = cluster.cmdb_ci_cluster_vip[i].ip_address;
                if (vips)
                    vips += ',';
                vips += vip;
            }
        }
        if (vips)
            parametersHashMap.put('vips', vips);
    },

    handleError: function(errors) {

        var lastState = null;
        for (var i = 0; i < errors.length && lastState === null; ++i) {
            var error = errors[i];
            if (error.indexOf('Connection failed') !== -1)
                lastState = DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY + ': No WMI connection';
            else if (error.indexOf('MID Server isn\'t Windows') !== -1)
                lastState = DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY + ': MID not Windows';
            else if (error.indexOf('Missing Classification Information') !== -1)
                lastState = DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY + ': Missing Information';
        }

        if (lastState === null) {
            lastState = DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY;
        }

        DiscoverySensor.prototype.handleError.call(this, errors, {
            sourceName: 'Windows Classify',
            lastState: lastState,
            deviceState: DiscoverySensor.DeviceStates.REJECTED,
            fireClassifiers: true
        });
    },

    isJsonUsed: function() {
        if (!JSON.nil(this.getParameter("output_format")) && this.getParameter("output_format") == 'json')
            return true;

        return false;
    },

    type: "DiscoverySensor"
});
