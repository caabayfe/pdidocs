new DiscoverySensor({
    prepare: function(results) {
        this.status = new DiscoveryStatus(agent_correlator);
        this.schedule = new DiscoverySchedule(this.status.scheduleID);
        this.midServer = MIDServer.getByName(this.getAgent());
        this.portProbes = this.getPortProbes();
        this.suppressProbeFlag = false;
        this.suppressProbeMap = {};
        this.delayWbemParm = (this.getParameter('delay_wbem') || '').toLowerCase();
        this.delayWbem = this.delayWbemParm != 'false';
        var launched = this.launchNextShazzamProbe();
        this.updateDiscoveryResult();

        if (!launched) {
            // We reached the end, mark any common errors from Shazzam resolved
            this.resolveOldErrors();

            // If all done then see if we have to launch wbem probes
            // Note that this happens before the current input gets
            // processed.
            if (this.delayWbem && this.shouldHandleWBEM())
                this.launchWbemProbes();
        }
    },

    getExpectedProbeCount: function(results) {
        var i, result,
            probesToProcess = results.length;

        for (i = 0; i < results.length; i++) {
            result = results[i];

            if (this.checkEmptyPayload(result) ||
                (this.checkErrorPayload(result) && ("" + this.getParameter('debug')).toLowerCase() != "true"))
                probesToProcess--;
        }

        return probesToProcess;
    },

    /*
     * Common errors for Shazzam for a Discovery with an associated schedule uses a special key. This function handles
     * resolving existing errors of this type.
     */
    resolveOldErrors: function() {
        // Shazzam errors from discoveries without a schedule will use an IP as the key and resolved later
        if (!this.schedule.valid)
            return;

        var key = 'ShazzamLaunch_' + this.schedule.name;
        this.errorManager.finishKeyInInstance(key, this.status.sysID);
    },

    /*
     * A retry discovery may be triggered to resolve an active error.  However, if the device is not reachable during this
     * attempt, the 'In discovery' error should be reverted to 'Active'.
     */
    handleErrorsForFailedDiscovery: function(ipAddress) {
        if (!this.status.isFromErrorRetry())
            return;

        if (JSUtil.nil(ipAddress))
            ipAddress = this.status.getIPFromRetryDiscovery();

        this.errorManager.handleFailedDiscovery(ipAddress);
    },

    /*
     * Invoked once for each "result" tag in the shazzam results (there is one result tag for every IP address scanned
     * that is either alive or active). We protect this method with a try/catch so that a problem in a single result
     * doesn't abort the entire Shazzam sensor...
     */
    process: function(sensorResult, wbemSpecialProcessing) {

        try {
            if (!wbemSpecialProcessing)
                wbemSpecialProcessing = this.delayWbem ? 'skip' : 'none';

            this.process_inner(sensorResult, wbemSpecialProcessing);
        } catch (e) {
            var result = new ShazzamResult(sensorResult);
            var errMsg = 'Exception in Shazzam with result from IP ' + result.ip + '; ' + e;

            this.errorManager.addError(new SNC.DiscoveryErrorMsg('SN-5999', result.ip, this.status.sysID, null, errMsg, null));

            DiscoveryLogger.warn(errMsg, 'Shazzam', this.getEccQueueId(), null);
            if (g_device)
                g_device.issue();
        }
    },

    process_inner: function(sensorResult, wbemSpecialProcessing) {
        var resetTo;

        if (!this.sanityCheck())
            return;

        // some setup...
        g_device = null;
        this.ciData = null;
        this.ciApps = null;
        this.errMsgs = [];
        this.probes = [];
        this.WMI = "WMI";
        this.WINRM = "WINRM";
        this.wmiProbeFired = false;
        this.deviceHistoryParams = null;

        var result = new ShazzamResult(sensorResult);

        var openPorts = [];
        var scannedPorts = [];

        this.ciData = new CIData();
        this.ciData.getData()['ip_address'] = result['ip'];

        this.updateLocation();

        var attributeHistorySysId;
        var attributeHistoryGr;
        // Getting IP attribute history 
        attributeHistoryGr = DiscoveryApiAttribute.getCIAttributeHistoryGr(this.status.scheduleID, 'ip', result.ip);
        // Query which range the IP comes from if there is no IP attribute history 
        if (JSUtil.nil(attributeHistoryGr)) {
            // Check last queried range to see if this IP is in the same range
            if (this.isIpInCachedRange(result.ip)) {
                attributeHistorySysId = DiscoveryApiAttribute.insertCIAttributeHistoryForIP(this.status.scheduleID, this.lastQueriedRange.attribute_value, result.ip);
            }

            // If we couldn't find from lastQueriedRange or lastQueriedRange was empty
            if (JSUtil.nil(attributeHistorySysId)) {
                attributeHistoryGr = DiscoveryApiAttribute.getCIAttributeHistoryGr(this.status.scheduleID, 'range', result.ip);
                attributeHistorySysId = DiscoveryApiAttribute.insertCIAttributeHistoryForIP(this.status.scheduleID, attributeHistoryGr.attribute_value, result.ip);
                this.populateLastQueriedRange(attributeHistoryGr);
            }
        } else {
            attributeHistorySysId = attributeHistoryGr.getUniqueValue();
        }

        if (JSUtil.notNil(attributeHistorySysId))
            this.ciData.getData().attribute_history_sys_id = attributeHistorySysId;

        this.logWarnings(result);

        this.preprocessScanners(result);

        if (this.status.discoverIPs())
            g_device = DeviceHistory.createDeviceHistory(result.ip, null, this.getEccQueueId());

        if (wbemSpecialProcessing != 'only') {
            // This object will be used for triggering the next classification probes (snmp, cim, etc.)
            // The object will be available as a probe parameter
            // Should be created prior to launching credentialless discovery directly
            this.deviceHistoryParams = {
                result: result,
                ecc_queue: this.getEccQueueId(),
                dns_name: this.ciData.getData()['dns_name'],
                errMsgs: this.errMsgs,
                status: this.status
            };

            // if the target can not be reached, make sure any "in-discovery" error messages are reverted to "active"
            if (!result.active)
                this.handleErrorsForFailedDiscovery(result.ip);

            // Conditionally run Credentialless discovery if the scanned device is Alive but not Active
            // and Shazzam is configured to discover CIs
            if (!result.active && result.alive && this.status.discoverCIs()) {

                // launchCredentiallessDeviceDiscovery() may or may not launch a probe and we can't easily
                // find out. Just disabled batch updates to discovery_status.started and let it do whatever
                // it decides to do.
                if (typeof _DO_NOT_UPDATE_STATUS_STARTED_COUNT != 'undefined') {
                    resetTo = _DO_NOT_UPDATE_STATUS_STARTED_COUNT;
                    (function() {
                        delete this._DO_NOT_UPDATE_STATUS_STARTED_COUNT;
                    })();
                }

                this.launchCredentiallessDeviceDiscovery(result['ip']);

                if (resetTo != undefined)
                    _DO_NOT_UPDATE_STATUS_STARTED_COUNT = resetTo;

                g_device = DeviceHistory.getFromSourceAndStatus(result.ip, agent_correlator);
                if (!g_device)
                    g_device = DeviceHistory.createDeviceHistory(result.ip, null, this.getEccQueueId());
                g_device.state(DiscoverySensor.HistoryStates.ALIVE_NOT_ACTIVE, '', this.status.logStateChanges, 'Shazzam', this.getEccQueueId());
                return;
            }

            // bail out of here if this isn't a response we should be handling...
            var includeThis = result.active || (result.alive && this.status.includeAlive);

            if (!includeThis)
                return;

            this.classifyIfCredentialLess(result);
            SNC.DiscoveryActiveError.cleanUp(result.ip);
        }

        this.processScanners(result, openPorts, scannedPorts, wbemSpecialProcessing);

        // launch our highest-priority classifier...
        if (this.status.discoverCIs() || this.status.discoverNets()) {
            var cp = new ClassifierProbes(this.probes, this.deviceHistoryParams);
            cp.launch(true);
        }
    },

    // Check if the port is open or resolved
    isWbemPortValid: function(result) {
        // iterate over all the individual scanner results...
        for (var i = 0; i < result.scanners.length; i++) {
            var scanner = result.scanners[i];
            if ((scanner.result == 'open' || scanner.result == 'resolved') && scanner.portProbe == 'wbem')
                return true;
        }

        return false;
    },

    processScanners: function(result, openPorts, scannedPorts, wbemSpecialProcessing) {
        // iterate over all the individual scanner results...
        for (var i = 0; i < result.scanners.length; i++) {
            var scanner = result.scanners[i];
            if (wbemSpecialProcessing == 'skip' && scanner.portProbe == 'slp')
                continue;
            scannedPorts.push(scanner.port);
            if (scanner.result == 'open')
                openPorts.push(scanner.port);
            if (result.active)
                this.processScanner(result, scanner);
        }
    },

    /*
     * Log any warnings based on the results of the scan.
     */
    logWarnings: function(result) {
        // only log these warnings if this is a ServiceWatch discovery
        if (this.status.source != 'ServiceWatch')
            return;

        var errMsg = "";
        var unOpenPorts = [];
        // if this result isn't active then don't check any of the scans..
        if (!result.active) {
            errMsg = "There was no open port on this target. The target may be alive but not active.";
            DiscoveryLogger.warn(errMsg, 'Shazzam', this.getEccQueueId(), null);
            return;
        }

        for (var i = 0; i < result.scanners.length; i++) {
            var scanner = result.scanners[i];
            var contents = scanner.contents;
            var isOpen = (scanner.result == 'open');
            var isResolved = (scanner.result == 'resolved');

            // if the port is neither open nor resolved, add it to the list
            if (!(isOpen || isResolved))
                unOpenPorts.push(scanner.port + '(' + scanner.portProbe + ')');
            // if the port is open and we get a response code, then give a connection refused warning..
            else if (!gs.nil(contents) && !gs.nil(contents.response_code) && contents.response_code != 200) {
                errMsg = "Port " + scanner.port + " is open, but the host is unreachable with status code " + contents.response_code;
                if (!gs.nil(contents.response_text))
                    errMsg += ": " + contents.response_text;
                errMsg += "\nCheck connectivity from the MID server to the host.";
                this.errorManager.addError(new SNC.DiscoveryErrorMsg('SN-1144', result.ip, this.status.sysID, null, errMsg, null));
                DiscoveryLogger.warn(errMsg, 'Shazzam', this.getEccQueueId(), null);
            }
        }

        // log all the unopen ports as a list
        if (unOpenPorts.length > 0) {
            errMsg = "The following ports are not open: " + unOpenPorts.join(", ");
            DiscoveryLogger.warn(errMsg, 'Shazzam', this.getEccQueueId(), null);
        }
    },

    handleWarning: function(warn) {
        if (warn.contains('is not a reachable host')) {
            var splittedMsg = warn.split(' ');

            this.errorManager.addError(new SNC.DiscoveryErrorMsg('SN-1144', splittedMsg[0], this.status.sysID, null, warn, null));
        }

        DiscoveryLogger.warn(warn, 'Discovery', this.getEccQueueId());
        if (g_device)
            g_device.issue();
    },

    /*
     * Run any port probe scripts we need to run, and adjust the "active" flag to "alive" for any ports that we can't
     * classify.
     */
    preprocessScanners: function(result) {
        // if this result isn't active, then we've got no preprocessing to do...
        if (!result.active)
            return;

        var anyActives = false;

        // iterate over all the individual scanner results...
        for (var i = 0; i < result.scanners.length; i++) {
            var scanner = result.scanners[i];
            var isOpen = (scanner.result == 'open');
            var isResolved = (scanner.result == 'resolved');

            // if this scanner doesn't have an open or resolved result, then there's no preprocessing needed...
            if (!isOpen && !isResolved)
                continue;

            // find matching stuff for this fellow, or bail out if we can't find one...
            var behavior = this.getBehavior(result);
            var stuff = behavior.getStuffForResult(result, scanner, this.status.getPhase(behavior), this.midServer, this.status);
            if (!stuff) {
                // record our failure to get a MID server for the port probe associated with this scanner...
                var logMsg = 'No MID server found to classify with ' + scanner.portProbe.toUpperCase();
                this.errMsgs.push(logMsg);
                continue;
            }

            // if we've got a script in this port probe, run it...
            this.suppressProbeFlag = false;
            if (stuff.portProbe.script) {
                try {
                    // get the parenthesized script into a function variable...
                    var func = eval('(' + stuff.portProbe.script + ')');
                    // execute the user's function...
                    func(this.ciData, result, scanner, this.status, this.midServer, this);
                } catch (error) {
                    var errMsg = 'Error evaluating port probe for ' + result.ip + ' (' + stuff.portProbe.name + ')';
                    errMsg += 'script: ' + error;
                    DiscoveryLogger.warn(errMsg, 'Shazzam', this.getEccQueueId(), null);

                    this.errorManager.addError(new SNC.DiscoveryErrorMsg('SN-5999', result.ip, this.status.sysID, null, errMsg, null));

                }
            }
            this.suppressProbeMap[stuff.portProbe.name] = this.suppressProbeFlag;
            // if we just found a classifiable port, say so...
            //if (!this.suppressProbeFlag && JSUtil.notNil(stuff.portProbe.triggersProbeID))
            if (!this.suppressProbeFlag && this.triggersProbe(stuff.portProbe.sysID))
                anyActives = true;
        }

        // adjust our active flag if we need to...
        if (!anyActives)
            result.active = false;
    },

    processScanner: function(result, scanner) {
        // if it's not open or resolved, then just move along...
        if ((scanner.result != 'open') && (scanner.result != 'resolved'))
            return;

        // find matching stuff for this fellow, or bail out if we can't find one...
        var behavior = this.getBehavior(result);
        var stuff = behavior.getStuffForResult(result, scanner, this.status.getPhase(behavior), this.midServer, this.status);
        if (!stuff)
            return;

        // if we've already fired a wmi classify probe for this result, don't do it again...
        var scannerPortProbe = scanner.portProbe.toUpperCase();
        if ((scannerPortProbe == this.WMI || scannerPortProbe == this.WINRM) && this.wmiProbeFired)
            return;

        // if we've got a classifier probe in this port probe, register it now...
        if (this.triggersProbe(stuff.portProbe.sysID) && !this.suppressProbeMap[stuff.portProbe.name]) {
            this.registerProbe(stuff, result.ip, scanner);
            if (scannerPortProbe == this.WMI || scannerPortProbe == this.WINRM)
                this.wmiProbeFired = true;
        }
    },

    getBehavior: function(result) {
        var behavior = this.schedule.getBehaviorForIP(result.ip);

        if (behavior)
            return behavior;

        if (this.schedule.behaviorID)
            return new DiscoveryBehaviorRecord(this.schedule.behaviorID, this.schedule.discover);

        return new DiscoveryBehaviorRecord(this.midServer);
    },

    /*
     * Create and populate the classifier parameters from the result record and it's scanners.
     */
    getClassifierParams: function(result) {
        var classifier_params = this.initClassifierParams(result);
        for (var i = 0; i < result.scanners.length; i++) {
            var scanner = result.scanners[i];
            this.accumulateClassifierParameters(scanner, classifier_params);
        }
        return classifier_params;
    },

    /*
     * Populate the classifier parameters with the base information from the result record.
     */
    initClassifierParams: function(result) {
        var params = {};
        params['ip'] = result['ip'];
        params['active'] = result['active'];
        params['alive'] = result['alive'];
        return params;
    },

    /*
     * Populate the classifier parameters with information from the result record and the scanner.
     * scanner:           The ShazzamScanner instance created from the result.
     * classifier_params: The hashmap of accumulated classifier parameters that we're going to add to.
     */
    accumulateClassifierParameters: function(scanner, classifier_params) {
        var scannerName = scanner['portProbe'] + '.' + scanner['service'] + '.';
        for (var name in scanner) {
            if (name == 'initialize' || name == 'contents' || name == 'domainName' || name == 'hostName')
                continue;
            classifier_params[scannerName + name] = scanner[name];
        }
        for (var name in scanner.contents)
            classifier_params[scannerName + name] = scanner.contents[name];
    },

    sanityCheck: function() {

        var errMsg = '';
        if (!this.status.isValid()) {
            errMsg = 'Invalid status record, agent_correlator: ' + agent_correlator;
            DiscoveryLogger.warn(errMsg, 'Shazzam', this.getEccQueueId(), null);

            this.errorManager.addError(new SNC.DiscoveryErrorMsg('SN-5999', result.ip, this.status.sysID, null, errMsg, null));

            return false;
        }

        if (!this.midServer.isValid()) {
            errMsg = 'Invalid MID Server record, name: ' + this.getAgent();
            DiscoveryLogger.warn(errMsg, 'Shazzam', this.getEccQueueId(), null);
            this.errorManager.addError(new SNC.DiscoveryErrorMsg('SN-5999', result.ip, this.status.sysID, null, errMsg, null));

            return false;
        }
        return true;
    },

    /*
     * Perform a credential-less classification on the given result, if we should.
     */
    classifyIfCredentialLess: function(result) {
        if (!this.status.discoverIPs() || !result.active)
            return;

        var classifier_params = this.getClassifierParams(result);

        // first we classify the apps by presenting a filtered set of info, per port probe, to the classifier...
        for (var i = 0; i < this.portProbes.length; i++) {
            var pp = this.portProbes[i];
            var prefix = pp.name + '.';
            var filtered_params = {};
            for (var pName in classifier_params) {
                if (pName.indexOf(prefix) != 0)
                    continue;
                filtered_params[pName] = classifier_params[pName];
            }
            var appClass = new DiscoveryClassification(this.getEccQueueRecord());
            var use_class = 'discovery_classy_scan_app';
            if (!appClass.find(use_class, filtered_params))
                continue;
            var sysClassName = appClass.getClassificationTable();
            var appName = appClass.getClassificationRecord().getValue('name');
            var rel_type = appClass.getClassificationRecord().getDisplayValue('relation_type');
            this.addScanIPApp(sysClassName, appName, rel_type);
        }

        // now we classifiy the CI...
        var dClass = DiscoveryClassification(this.getEccQueueRecord());
        var use_class = 'discovery_classy_scan';
        if (!dClass.find(use_class, classifier_params)) {
            g_device = DeviceHistory.createDeviceHistory(result.ip, null, this.getEccQueueId());

            if (!JSUtil.nil(this.ciData.getData()['dns_name']))
                g_device.setDNSName(this.ciData.getData()['dns_name']);
            g_device.state('Active', result.active ? 'Classifying' : '', this.status.logStateChanges,
                'Shazzam', this.getEccQueueId());
            for (var i = 0; i < this.errMsgs.length; i++) {
                DiscoveryLogger.warn(errMsgs[i], 'Shazzam', this.getEccQueueId(), null);
                g_device.issue();
            }
            if (g_device)
                g_device.state('Unclassified', '', false, null);
            return;
        }

        if (g_device) {
            g_device.setClassifiedAs(dClass.getClassificationTable());
            var classifierName = dClass.getClassificationRecord().getValue('name');
            g_device.state('Classified', classifierName, false, null);
        }
    },

    addScanIPApp: function(sysClassName, appName, rel_type) {},

    triggersProbe: function(portProbe) {
        var gr = new GlideRecord('trigger_probe_m2m');
        gr.addQuery('port_probe', portProbe);
        gr.addQuery('active', true);
        gr.query();
        return gr.hasNext();
    },

    getPortProbes: function() {
        var portProbes = [];
        var gr = new GlideRecord('discovery_port_probe');
        gr.query();
        while (gr.next()) {
            var pp = new DiscoveryPortProbe(gr);
            portProbes.push(pp);
        }
    },

    /*
     * We want to do this exactly one time, after all Shazzam input payloads are
     * available.  (We need all Shazzam inputs because SLP provides information
     * about other IP addresses which may exist in different payloads.)
     */
    launchWbemProbes: function() {
        var queueSysId = g_probe.getEccQueueRecord().sys_id,
            _this = this;

        // Get all Shazzam Input Payloads
        var gr = new GlideRecord('ecc_queue');
        gr.addQuery('queue', 'input');
        gr.addQuery('agent_correlator', this.status.sysID);
        gr.addQuery('topic', 'Shazzam');
        gr.addQuery('sys_created_on', '>=', this.status.createdOn);
        gr.orderByDesc('sequence'); // Ensure a consistent ordering so the "last" response is always the same
        gr.query();

        var shazzamProbes = parseInt(g_probe.getParameter('shazzam_probes'));
        var wbemScannerMap = {};
        var allResults = [];

        // In case we are in a cluster, compare the number of shazzam probes with what's in db
        // This makes sure we only try to launch wbem probes after we have all shazzam inputs
        if (shazzamProbes > gr.getRowCount())
            return;

        while (gr.next()) {
            // Make sure we're the last shazzam probe.  This ensures that we'll only launch wbem
            // probes once.
            if (queueSysId && (queueSysId != gr.sys_id))
                return;
            queueSysId = 0;

            var doc = g_probe.getJsonPayload(gr);

            if (!gs.nil(doc)) {
                // Create a map of the scanners we will need to process.
                // Key will be ip_address+service and value will be wbem scanner
                mapResults(g_array_util.ensureArray(doc.result));
            } else {
                var msg = "Could not process payload from ecc_queue: " + gr.sys_id + ". Please check payload XML or try setting System Property 'glide.util.xml.transformer.handle.utf16_surrogate_pairs' to true.";
                DiscoveryLogger.warn(msg, 'Shazzam', this.getEccQueueId(), null);
            }
        }

        // Make sure these can be garbage collected
        doc = 0;
        gr = 0;

        // Launch WBEM probes
        allResults.forEach(
            function(result) {
                result.scanners.forEach(
                    function(scanner, idx, scanners) {
                        var key = result.ip + scanner.service;

                        if (wbemScannerMap[key]) {
                            wbemScannerMap[key].name = scanner.name;
                            wbemScannerMap[key].protocol = scanner.protocol;
                            wbemScannerMap[key].result = scanner.result;
                            scanners[idx] = wbemScannerMap[key];
                        }
                    });

                _this.process(result, 'only');
            });

        // Go through all results and create map
        function mapResults(results) {
            results.forEach(
                function(result) {
                    result = new ShazzamResult(result);

                    // We've already handled scanners that don't have valid wbem ports
                    if (!_this.isWbemPortValid(result))
                        return;

                    allResults.push(result);
                    result.scanners.forEach(
                        function(scanner) {
                            if (scanner.portProbe == 'slp') {
                                scanner.scanners.forEach(
                                    function(subScanner) {
                                        var key = subScanner.ipAddress + subScanner.service;
                                        wbemScannerMap[key] = subScanner;
                                    });
                            }
                        });
                });
        }
    },

    _getShazzamBatchSizeDefaultValue: function() {
        var dictionaryGR = new GlideRecord('sys_dictionary');
        dictionaryGR.addQuery('name', 'discovery_schedule');
        dictionaryGR.addQuery('element', 'shazzam_batch_size');
        dictionaryGR.query();

        var shazzamBatchSize = '1000';
        if (dictionaryGR.next()) {
            shazzamBatchSize = dictionaryGR.getValue('default_value');
            if (isNaN(parseInt(shazzamBatchSize)))
                shazzamBatchSize = '1000';
        }
        return shazzamBatchSize;
    },

    launchNextShazzamProbe: function() {
        // list of parameters to propagate to next batch
        var parametersToPropagate = ['SNMP_use_v3', 'SNMP_use_v1_v2c', 'port_probe_spec',
            'report_inactive', 'report_dead', 'mid_selector_details',
            'shazzam_probes', 'json_ranges'
        ];
        try {
            var dr, rangeString;

            var probe = SncProbe.get('Shazzam');
            probe.setName(this.getParameter('name'));
            probe.setCorrelator(this.getParameter('agent_correlator'));
            // Set Shazzam probe with priority "Expedited"
            var eccPriority = '1';
            probe.setEccPriority(eccPriority);

            var useJSONForRanges = this.getParameter('json_ranges') == 'true';

            probe.addParameter('delay_wbem', this.delayWbem ? 'true' : 'false');

            // Full Range
            var fullRange = this.getParameter('full_range');
            if (!fullRange)
                return false; // Nothing to do here
            probe.setSource('See Payload');
            probe.addParameter('full_range', fullRange, useJSONForRanges);

            // Mid Range
            var midRange = this.getParameter('mid_range');
            if (!midRange)
                return false; // Nothing to do here
            probe.setSource('See Payload');
            probe.addParameter('mid_range', midRange, useJSONForRanges);

            // Range Index
            var rangeIndex = parseInt(g_probe.getParameter('range_index'));
            rangeIndex = rangeIndex + 1;
            probe.addParameter('range_index', rangeIndex);

            if (useJSONForRanges)
                dr = SNC.DiscoveryRanges.fromJSON(midRange);
            else
                dr = SNC.DiscoveryRanges.fromXML(midRange);

            var batchSize = this.schedule.shazzamBatchSize;
            if (!batchSize)
                batchSize = this._getShazzamBatchSizeDefaultValue();
            var batches = dr.toBatchesBySize(batchSize);
            if (batches.length <= rangeIndex)
                return false; // Nothing to do here

            // Range
            if (useJSONForRanges)
                rangeString = batches[rangeIndex].toJSON();
            else
                rangeString = GlideXMLUtil.toString(batches[rangeIndex].toXML().getDocumentElement());

            // This should never happen, but if it does it would result in an infinite
            // number of empty Shazzams.
            if (!rangeString)
                return false;

            probe.addParameter('range', rangeString, useJSONForRanges);

            // Check if DiscoveryStatus's priority is set and higher (smaller number) than current probe's priority
            if (this.status.priority && (parseInt(this.status.priority, 10) < parseInt(eccPriority, 10)))
                probe.setEccPriority(this.status.priority);

            // propagate parameters
            for (var i = 0; i < parametersToPropagate.length; i++) {
                var parameterName = parametersToPropagate[i];
                var parameterValue = this.getParameter(parameterName);
                if (JSUtil.notNil(parameterValue))
                    probe.addParameter(parameterName, parameterValue);
            }
            // Fire Shazzam probe on same mid server
            probe.create(g_probe.getAgent(), this.getEccQueueId());
            return true;
        } catch (e) {
            gs.log('Error in launchNextShazzamProbe: ' + e.name + ' (' + e.message + ')');
        }

    },

    suppressProbe: function() {
        this.suppressProbeFlag = true;
    },

    /*
     * Overriding DiscoverySensor.save(), because we don't need to save anything here...
     */
    save: function() {},

    registerProbe: function(stuff, ip, scanner) {
        var midServer;
        if (this.schedule.midSelectBehavior()) {
            var midServers = stuff.functionality.midServers;

            // Create list of sysIDs from MidServers
            var midServerIds = midServers.map(function(mid) {
                return mid.sysID + '';
            });

            // Use mid server selector to select the best mid
            var midSelector = new SNC.MidSelector();
            midServer = new MIDServer(midSelector.selectBestMidFromList(midServerIds));
        } else
            midServer = this.midServer;

        // create a probe info record...
        var probeInfo = {};
        probeInfo['ip'] = ip;
        probeInfo['classificationTable'] = stuff.portProbe.classy;
        probeInfo['portProbeID'] = stuff.portProbe.sysID;
        probeInfo['scannerPort'] = scanner.port;
        probeInfo['discover'] = this.status.discover;
        probeInfo['classificationPriority'] = stuff.portProbe.classificationPriority;
        probeInfo['midServerID'] = midServer.sysID;
        probeInfo['shazzamSensorID'] = g_probe.getEccQueueId();
        probeInfo['supplementary'] = stuff.portProbe.supplementary;
        probeInfo['ciData'] = this.ciData.toXML();
        probeInfo['priority'] = this.status.priority;
        probeInfo['mid_selector_details'] = g_probe.getParameter('mid_selector_details');
        this.probes.push(probeInfo);
    },

    updateLocation: function() {
        if (!this.schedule.location)
            return;

        this.ciData.getData()['location'] = this.schedule.location;
    },

    shouldHandleWBEM: function() {
        var probeSpec = this.getParameter('port_probe_spec');

        return (JSUtil.nil(probeSpec) || probeSpec.indexOf('<name>wbem</name>') >= 0);
    },

    /*
     * Override method in DiscoverySensor to prevent incorrect incrementing of device history...
     */
    updateDeviceCount: function() {},

    updateDiscoveryResult: function() {
        var errorMessage = document['@error'];

        // If we have an error we can skip updating the discovery fields as they are non-existing or irrelevant
        if (errorMessage)
            return;

        var dr = new DiscoveryResult(this.status.sysID);
        var total = parseInt(document['@total'], 10);
        var alive = parseInt(document['@alive'], 10);
        var active = parseInt(document['@active'], 10);
        var dead = (total - alive);

        total && dr.incrementField('n_total_ips', total);
        alive && dr.incrementField('n_alive_ips', alive);
        active && dr.incrementField('n_active_ips', active);
        dead && dr.incrementField('n_dead_ips', dead);
    },

    /**
     * Checks if an IP belongs to the cached range
     */
    isIpInCachedRange: function(ip) {
        if (!this.lastQueriedRange)
            return false;

        switch (this.lastQueriedRange.type) {
            case 'range':
                return this.isIpInRange(ip, this.lastQueriedRange.start_ip_address, this.lastQueriedRange.end_ip_address);
            case 'list':
                return this.isIpInList(ip, this.lastQueriedRange.ip_address_list);
            default:
                return false;
        }
    },

    /**
     * Checks if an IP is within a given range
     */
    isIpInRange: function(ip, startIp, endIp) {
        var ipAddress = SncIPAddress.fromString(ip);

        // Range only allows IPv4
        if (!ipAddress || !ipAddress.isV4())
            return false;

        var ipExpanded = ipAddress.toExpanded();
        var startIpExpanded = SncIPAddress.getExpanded(startIp);
        var endIpExpanded = SncIPAddress.getExpanded(endIp);
        return (startIpExpanded <= ipExpanded && endIpExpanded >= ipExpanded);
    },

    /**
     * Checks if an IP belongs to an IP list
     */
    isIpInList: function(ip, ipAddressListId) {
        return JSUtil.notNil(DiscoveryApiAttribute.getCIAttributeHistoryGr(this.status.scheduleID, 'range', ip, ipAddressListId));
    },

    /**
     * Populates lastQueriedRange from attribute history record
     */
    populateLastQueriedRange: function(attributeHistoryGr) {
        this.lastQueriedRange = {
            attribute_value: attributeHistoryGr.getValue('attribute_value')
        };

        if (JSUtil.notNil(attributeHistoryGr.start_ip_address) && JSUtil.notNil(attributeHistoryGr.end_ip_address)) {
            // IP range/network
            this.lastQueriedRange.type = 'range';
            this.lastQueriedRange.start_ip_address = attributeHistoryGr.getValue('start_ip_address');
            this.lastQueriedRange.end_ip_address = attributeHistoryGr.getValue('end_ip_address');
        } else if (JSUtil.notNil(attributeHistoryGr.ip_address_list)) {
            // IP List
            this.lastQueriedRange.type = 'list';
            this.lastQueriedRange.ip_address_list = attributeHistoryGr.getValue('ip_address_list');
        }
    },

    type: "DiscoverySensor"
});
