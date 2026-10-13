/**
 * Implements the identification phase of Discovery based on the JSONSensor and MultiSensor architecture.
 *
 * Aleck Lin aleck.lin@servicenow.com
 */

var DiscoveryJSONIDSensor = Class.create();

DiscoveryJSONIDSensor.prototype = Object.extendsObject(DiscoveryJSONMultiSensor, {
    MATCH_FOUND: "Found a match in CMDB",
    LOCK_FAILED: "Lock Failed",
    RETURN_FALSE: "false",
    RETURN_TRUE: "true",
    IDENTIFIED_IGNORE_EXTRA_IP: "Identified, ignored extra IP",

    finish: function() {
        // if there is an error in any of the identification probes, we want to stop the discovery of the device here
        if(JSUtil.notNil(this.has_error) && this.has_error) {
            DiscoveryLogger.warn('Identification failed due to error in at least one of the identification probes, skipping exploration.', this.type, this.getEccQueueId());
            return;
        }

        this.status = new DiscoveryStatus(agent_correlator);
        this.schedule = new DiscoverySchedule(this.status.scheduleID);
        this.isDupeCI = false;
        this.isSameIP = false;
        this.cigr = null;
        this._isNewCI = false;

        // Use the CMDB Identification API if the property is true or service mapping plugin is active otherwise default to old implementation
        if (DiscoveryCMDBUtil.useCMDBIdentifiers()) {
            if (!this.CMDBIdentify())
                return;
        } else {
            //Start the identification process...
            if (this.identify()) {
                // If we're here. It means we have one and exactly one match.
                // Analyze if we already have a match in the device history
                if (!this.analyzeAndExplore())
                    return;

            } else {
                if (!this.continueDiscovery())  //Basically if this.explore is false, we don't wanna continue
                    return;

                var result = this.createAndExplore();
                if (!this.processCreateAndExplore(result))
                    return;
            }

            if (!this._isNewCI)
                this.processCIData();

        }
        // show that we were successful with this probe...
        g_device.markScanned(this.getParameter('port_probe'));

        this.logExploration();

        this.triggerProbes();

        // update device history with our state change...
        g_device.state(this._isNewCI ? 'Created CI' : 'Identified CI', 'Updating CI', this.status.logStateChanges,
            this.type, this.getEccQueueId());

        this.fireSupplementaryClassifiers();
    },

    /*
     * Beginning of CMDB Identification Engine Hook
     * ============================================
     *
     * See: DiscoveryCMDBUtil script include for payload building logic and API calls
     */
    CMDBIdentify: function() {
        var idResult;
        var loggedAttempts = false;
        var logger = new DiscoveryLogger();
		var debugLevel = gs.getProperty("glide.discovery.identification.log_level");
        logger.setSource(this.type);
        logger.setSensor(this.getEccQueueId());

        this.setDefaultSave(false); // Insert & Update handled by CMDB Engine
        this.explore = true; // Set this flag to true since the IE will only ever return one match

        /*
         * First check if the CI would be an insert or update
         *
         * If it's an update, we'll get a sys_id back and we can
         * adjust the ciData to handle special cases such as:
         * 1. Preventing IP address flipping
         * 2. Preventing hostname & name flipping
         *
         */
        idResult = DiscoveryCMDBUtil.checkInsertOrUpdate(this.ciData, logger);

		// Check the ID result, return on error.
		idResult = this.checkIDResult(idResult, debugLevel, null, "Unexpected error on identification and reconciliation");

		if(!idResult.success)
			return false;

        // We'll only get a sysId if the result of the check was a match/update
        // Also make sure class name of match and ciData are the same so
        // that we don't prevent reclassification by passing in sys_id
        if (idResult.sysId && idResult.className === this.ciData.getData().sys_class_name) {
            // Log the attempts here because the later commit API call will not use matching
            DiscoveryCMDBUtil.logIDAttempts(idResult.attempts, logger);
            loggedAttempts = true;
            this.getAndSetCi(idResult.className, idResult.sysId);
            this.preventCiDataFlipping();
            /*
             * Add the sys_id to ciData so that the engine does not need to run
             * through the identifiers again when writing data. This also prevents
             * the case where a CI was matched on name, but we took that out to prevent
             * flipping - if it ran through the identifiers again the name identifier would
             * be skipped and a new CI would be inserted with no name
             */
            this.ciData.getData().sys_id = idResult.sysId;

            // check before we commit the update if this is a duplicate IP for the same device ...
            if (!this.analyzeAndExplore())
            	return false;
        }

        /*
         * Regardless of insert or update, we want to add the model info if we have it
         * now or stub out 'Unknown' if we obtain it later
         */
        this.processModel(this.cigr);

        // Now lets actually commit the insert or update
        idResult = DiscoveryCMDBUtil.insertOrUpdate(this.ciData, logger);

		var errorMsg;
		if(idResult.insert)
			errorMsg = "Unexpected error inserting CI";
		else
			errorMsg = "Unexpected error updating CI";

        // Check the ID result, return on error.
		idResult = this.checkIDResult(idResult, debugLevel, null, errorMsg);

        if (!idResult.success)
			return false;

        if (!loggedAttempts) {
            DiscoveryCMDBUtil.logIDAttempts(idResult.attempts, logger);
            loggedAttempts = true;
        }

        if (idResult.insert)
            this._isNewCI = true;

        this.getAndSetCi(idResult.className, idResult.sysId);

        // check after we commit the insert or update if this is a duplicate IP for the same device ...
        if (!this.analyzeAndExplore())
            return false;

        /*
         * Reconcile the related lists
         */
        this.convertRelatedLists();
        new DiscoveryReconciler(this.cigr, this.relatedListdataObj).process();
        this.setValues(); // set IP addresses for DNS probe
        return true;
    },

    handleFailure: function() {
        this.logNoExploration();
        this.setTriggerProbes(false);
    },
	
	// Check the ID result, if there is an error, rerun it and get contextId for more debug logging.
	checkIDResult: function(idResult, debugLevel, logger, errorMessage) {
		if (!idResult.success) {
			// If it fails and we have a context ID, rerun identification once for more debug logging.
			if(JSUtil.notNil(idResult.logContextId)){
				idResult = DiscoveryCMDBUtil.rerunIDWithLogContext(idResult.logContextId, debugLevel, debugLevel, logger);
				// Log identification log only for re-run, since only re-run has run ID.
				this.logIDLog(idResult.logContextId, errorMessage);
			}
			if (!idResult.success) {
				this.handleFailure();
			}
		}
		return idResult;
	},
	
	logIDLog: function(logContextId, message) {
		if (!g_device || JSUtil.nil(logContextId))
            return;
		DiscoveryLogger.warn(message + ', see: [code]<a href = "nav_to.do?uri=%2F$identificationLogs?context_id=' + logContextId +'" target="_blank"><u>Identification log</u></a>[/code]', this.type, this.getEccQueueId(), this.CISysID);
	},

    getAndSetCi: function(className, sysId) {
        this.CISysID = sysId;
        this.cigr = new GlideRecord(className);
        if (this.CISysID)
            this.cigr.get('sys_id', this.CISysID);
    },

    /*
     * End of CMDB Identification Engine Hook
     * ======================================
     */

    /*
     *  Run the CI data we've gathered so far and run it through the identifiers.
     */
    identify: function() {
        var CIID = new CIIdentification(this.ciData, new DiscoveryLogger());
        var idResult = CIID.process();
        this.explore = idResult.explore;
        this.CISysID = idResult.sys_id;

        if (JSUtil.nil(this.CISysID))
            return false;

        return true;
    },

    /*
     *  This method is called when we have one and exact one match from the identification process.
     *  @returns false if we shouldn't continue explore due to duplicate IPs or lock failed.
     */
    analyzeAndExplore: function() {
        // Set up the mutex to be used
        var mutexName = "SYSTEM_LOCK:cmdb_ci:"+this.CISysID;
        var rl = new GlideRecordLock('cmdb_ci', this.CISysID);
        // limit our attempt to get a mutex to 120 seconds...
        rl.setSpinWait(300);
        rl.setMaxSpins(400);
        rl.setLockDuration(120); //seconds

        if (rl.get()) {
            this.debug("Obtained a lock on mutex => " + mutexName);
            try {
                this.analyze();
                if (!this.continueDiscovery())
                    return false;

                this.debug("Updating the device history with the CI " + this.CISysID);
                this.cigr = new GlideRecord('cmdb_ci');
                if (this.CISysID)
                    this.cigr.get('sys_id', this.CISysID);
                this.createOrUpdateDeviceHistory();
            } finally {
                rl.release();
            }
        } else {
            // Log lock failed...
            var msg = "Unable to lock on to " + mutexName + " for CI creation";
            this.getLogger().warn(msg);
            gs.log(msg);
            return true;
        }

        return true;
    },

    /*
     *  We need to check the device history to see if the CI we're exploring has other IP addresses
     *  we're also concurrently exploring. If there is, we need to mark that it's duplicate.
     *  Also, it's possible we have more than one identity sensors (wmi, snmp or ssh) that tries to explore
     *  the same IP because the previous one failed. In this case, we need to mark it as having the same IP.
     */
    analyze: function() {
        if (!this.explore || !this.CISysID)
            return;

        var gr = new GlideRecord('discovery_device_history');
        gr.addQuery('status', agent_correlator);
        gr.addQuery('cmdb_ci', this.CISysID);
        gr.addQuery('last_state', '!=', this.IDENTIFIED_IGNORE_EXTRA_IP);
        gr.query();
        this.isDupeCI = gr.next();
        if (this.isDupeCI) {
            this.debug("Found a duplicate CI " + this.CISysID + " in device history!");
            if (!g_device) {
                g_device = new DeviceHistory(gr);
                this.isSameIP = ((gr.source + '') == this.getSource());
            } else {
                this.isSameIP = ( ''+g_device.getSource() == ''+gr.source );
            }
        }
    },

    /*
     *  This method basically determines if we should continue with the CI. Here are the scenarios we check for
     *  1. If the in the identification process, we found out that this.explore is false (which means there are
     *     multiple matches or no matchable info)
     *  2. If there was exactly one match (implies this.explore is true), then we need to see if it's just another IP
     *     address on a CI we've already explored. If it is, then we don't want to continue explore it. However, in the
     *     case where there are multiple identity sensors, we need to continue exploring the CI (hence the
     *     this.isSameIP variable).
     */
    continueDiscovery: function() {
        if (!this.explore || (this.isDupeCI && !this.isSameIP)) {
            this.logNoExploration();
            this.setTriggerProbes(false);
            return false;
        }

        return true;
    },

    logNoExploration: function() {
        if (!g_device)
            return;

        // log our intent NOT to explore...
        var log_device = g_device;
        if (typeof this.ciData.data.ip_address !== 'undefined' && this.ciData.data.ip_address !== (''+g_device.getSource()))
            log_device = DeviceHistory.getFromSourceAndStatusAndClassification(g_device.getSource(), agent_correlator, g_probe.getParameter('classification_probe'));
        var dlog = new DiscoveryLogger(agent_correlator, log_device.getSysID());
        if (JSUtil.notNil(this.CISysID)) {
            var rec = new RecordToHTML('cmdb_ci', this.CISysID, '${name}',  true);
            dlog.info('[code]Not exploring CI: ' + rec.toString() + '[/code]', this.type, this.getEccQueueId(),
                this.CISysID);
        } else
            dlog.info('Not exploring device', this.type, this.getEccQueueId());

        this.createDeviceHistory();
		if (!this.CISysID) {
			g_device.state("Classified, couldn't identify", '', this.status.logStateChanges, this.type, this.getEccQueueId());
			return;
		}
		
		g_device.setCISysID(this.CISysID);

        // update device history with our state change...
        if (!this.explore && !(this.isDupeCI && !this.isSameIP))
            g_device.state('Identified, not updating CI', '', this.status.logStateChanges, this.type, this.getEccQueueId());
        else
            g_device.state(this.IDENTIFIED_IGNORE_EXTRA_IP, '', this.status.logStateChanges, this.type, this.getEccQueueId());
    },

    /*
     *  This method is invoked when there are no match in the CMDB, but we have matchable info the CI data.
     *  In concurrent situations, before we create a CI, we need to lock and check to see if another thread might've
     *  come in before and created the CI already.
     *
     *  @returns false if we shouldn't explore (due to multiple match or no matchable info)
     *           true if we successfully created a CI
     *           "found a match in CMDB" if we found a match in the CMDB
     */
    createAndExplore: function() {
        // use the list of ip_address as mutex
        var ips = this.getIPv4Addresses();
        // Set up the mutex to be used
        // Use sorted list of ip addresses as part of the mutex name
        var ip_hashcode = (new GlideChecksum(ips.sort())).getMD5();
        var mutexName = '<<<--Identity Sensor Mutex of '+ this.ciData.getData().sys_class_name + ':' + ip_hashcode + '-->>>';
        var mutexMetricName = 'DiscoveryJSONIDSensor';
        var mutex = new SelfCleaningMutex(mutexName, mutexMetricName);
        // limit our attempt to get a mutex to 120 seconds...
        mutex.setSpinWait(500);
        mutex.setMaxSpins(240);
        mutex.setMutexExpires(120000); //120 seconds

        if (mutex.get()) {
            try {
                this.debug("Obtained a lock on mutex " + mutexName);

                if (this.identify()) {
                    // If we're here. It means we have one and exactly one match because the some other thread had
                    // already got in and created an CI, so let's get out of here.
                    this.debug("Found a CI match in the CMDB before creating the CI");
                    return this.MATCH_FOUND;
                } else {
                    if (!this.continueDiscovery())
                        return this.RETURN_FALSE;

                    this.createOrUpdateDeviceHistory();
                    this.insertCI();
                    this.setDefaultSave(false); // We've already handled the CI insertion/updates, so disable the default save
                }
            } finally {
                mutex.release();
            }
        } else {
            //lock failed...
            gs.log("Unable to lock on to " + mutexName);
            return this.LOCK_FAILED;
        }

        return this.RETURN_TRUE;
    },

    /*
    *  Insert the CI record into the CMDB. This should be the only entry point of the entire Discovery for hardware (and VMs) CIs.
    *  This function mimics the update() function in the base class.
    */
    insertCI: function() {
        // We need to process the full data now so that any current discovery (same device, different ips) could find the one we just created.
        this.processCIData();

        var gr = new GlideRecord(this.ciData.getData()['sys_class_name']);
        for (var fieldName in current) {  // current is set in processCIData
            gr.setValue(fieldName, current[fieldName]);
            this.debug("gr[" + fieldName + "] = '" + current[fieldName] + "'");
        }

        g_disco_functions.updatedHistory(gr, this.getSensorName(), this.getEccQueueId()); // Needs to be run before the insert takes place => does this still make sense?
        {
            var sys_id = gr.insert(this.getSensorName());
            // Add the CI we just created to the device history. It is very important to update the device history right after because if another thread (in the scenario of a CI having more than 1 IP address) picks up the CI we have just created through the identification process, then we expect it to NOT continue to explore the device. The way it knows is by querying the device history table to see if an entry already exist for this sys_id. Granted it's possible the race condition could still occur if the other thread comes in right in the middle of here, but the likelihood is quite low. And if it did once in a blue moon, it's not the worst thing in the world.
            g_device.changeCI(gr);
        }

        this.debug("Created a new CI " + sys_id + " and updating the device history");
        this._isNewCI = true;
        this.CISysID = sys_id;

        // Actually setting the cigr here...
        this.cigr = new GlideRecord(gr.sys_class_name);
        if (sys_id)
            this.cigr.get('sys_id', sys_id);

        // update the necessary related lists
        new DiscoveryReconciler(this.cigr, this.relatedListdataObj).process();
    },

    /*
     * If we found a match right before we create an CI, that means some other thread was exploring the same CI and
     * created it in the CMDB. We need to go back and treat it as if we had just found a match to begin with.
     */
    processCreateAndExplore: function(result) {
        if (result == this.MATCH_FOUND)
            if (!this.analyzeAndExplore())
                return false;

        if (result == this.RETURN_FALSE || result == this.LOCK_FAILED) //no more exploration or lock failed...
            return false;

        return true;
    },

    createOrUpdateDeviceHistory: function() {
        // if necessary, make a device history record...
        if (!this.isDupeCI)
            this.createDeviceHistory();

        // if this device history was created by Shazzam, it will have no CI or CI sys_id...fix that...
        // this.cigr doesn't exist yet when a new CI is being created, so we need to make sure we don't call changeCI
        if (JSUtil.notNil(this.cigr))
            g_device.changeCI(this.cigr);
    },

    createDeviceHistory: function() {
        if (g_device)
           return;

        var ip = this.ciData.getData()['ip_address'];
		var ecc = this.getEccQueueId();
		var classificationProbe = g_probe.getParameter('classification_probe');
		g_device = DeviceHistory.createDeviceHistory(ip, this.cigr, ecc, classificationProbe);
    },

    logExploration: function() {
        // log our intent to explore...
        var rec = new RecordToHTML(this.cigr.sys_class_name, this.cigr.sys_id, this.cigr.name, true);
        DiscoveryLogger.info('[code]Exploring CI: ' + rec.toString() + '[/code]', this.type, this.getEccQueueId());
    },

    preventCiDataFlipping: function() {
        this.processHostName(this.cigr);
        this.processIPAddressField(this.cigr);
    },

    /*
     * Allows related lists to be reconciled by adding to relatedListdataObj in base DiscoverySensor
     */
    convertRelatedLists: function() {
        this.ciData.convertRelatedList(this, 'cmdb_ci_network_adapter', 'cmdb_ci', 'mac_address,name');
        this.ciData.convertRelatedList(this, 'dscy_router_interface',   'cmdb_ci', 'mac_address,name');
        this.ciData.convertRelatedList(this, 'cmdb_serial_number',      'cmdb_ci', 'serial_number,serial_number_type');
        this.ciData.convertRelatedList(this, 'cmdb_ip_service_ci',   'ci'    , 'service');
    },

    processCIData: function() {
        this.ciData.getData()['discovery_source'] = gs.getProperty('glide.discovery.source_name', "ServiceNow"); // Mark that it was Discovery that discovered it.
        if (this.shouldUpdateFirstDiscovered())
            this.ciData.getData()['first_discovered'] = ''+new GlideDateTime();

        this.ciData.getData()['last_discovered']= ''+new GlideDateTime();

        this.preventCiDataFlipping();
        this.processModel(this.cigr);
        this.debug(this.ciData.toString());

        current = this.ciData.getData();
        this.setValues();

        this.convertRelatedLists();
    },

    shouldUpdateFirstDiscovered: function() {
        if (JSUtil.nil(this.cigr)) // this.cigr is null, then it's a new record about to be inserted.
            return true;

        if (JSUtil.nil(this.cigr.first_discovered))
            return true;

        return false;
    },

    processHostName: function(cigr) {
        if (JSUtil.nil(cigr)) // if cigr is null, then it's a new record about to be inserted.
            return;

        var newName = this.ciData.getData()["name"];
        var oldName = cigr.name;
        var newDnsDomain = this.ciData.getData()["dns_domain"];
        var oldDnsDomain = cigr.dns_domain;

        // skip update of the CI DNS Domain[dns_domain] column value?
        // Delete the [dns_domain] field from the ciData to prevent update.
        if (! JSUtil.nil(newDnsDomain) && (newDnsDomain == oldDnsDomain))
            delete this.ciData.getData()["dns_domain"];

        // skip update of the CI (DNS) Name [name] column value?
        // Delete the [name] field from the ciData to prevent update.
        if (! this.shouldUpdateHostName(newName, oldName, cigr))
            delete this.ciData.getData()["name"];
    },

    shouldUpdateHostName: function(newName, oldName, cigr) {
        if (JSUtil.nil(newName) || newName == oldName)
            return false;

        if (JSUtil.nil(oldName) || oldName.toLowerCase() == "unknown.host")
            return true;

        var alwaysUpdate = JSUtil.toBoolean(gs.getProperty("glide.discovery.hostname.always_update", "true"));
        if (alwaysUpdate) {
            // If the new name already exists in the DNS table and so is the existing name,
            // then don't update it. This is to address the issue where the DNS name Disco gets back
            // in Shazzam can be in any order if there are more than one names

            if (this._isPrefixOfDomainName(oldName, newName) || this._isPrefixOfDomainName(newName, oldName))
                return true;

            if (JSUtil.toBoolean(gs.getProperty("glide.discovery.hostname.dns_nbt_trusted", "false")))
                if (this._isOneOfDNSNames(newName, cigr) && this._isOneOfDNSNames(oldName, cigr))
                    return false;

            return true;
        }
	    return false;
    },

	_isPrefixOfDomainName: function(newName, oldName) {
		var newNameArray = newName.split('.');
		var oldNameArray = oldName.split('.');
		return newNameArray[0] === oldNameArray[0];
	},

    _isOneOfDNSNames: function(newName, cigr) {
        // get a list of the DNS names
        var gr = new GlideRecord('cmdb_ip_address_dns_name');
        gr.addQuery('ip_address.nic.cmdb_ci', cigr.sys_id);
        gr.addQuery('ip_address.nic.install_status', '!=', 100);
        gr.addQuery('ip_address.install_status', '!=', 100);
        gr.query();
        var dns_ids = [];
        while (gr.next()) {
            var dnsName = gr.dns_name.name;
            if (JSUtil.nil(dnsName))
                continue;

            if (dnsName.indexOf(newName) == 0) // name is either an exact match of fqnd or at least match on the hostname portion of the fqdn {
                return true;
        }

        return false;
    },

    /*
     *  The issue is that if there's a CI with two or more IP addresses, the IP address field (which is determined by
     *  the IP address we happen to go after per discovery) could potentially flip-flop between addresses. We shouldn't do that
     *  so...
     *  If the IP address field is empty, let's always update.
     *  If the IP address field value and the IP we discover from are the same, then we're done.
     *  If the related list for network adapter is missing, then it signifies an error in the input and we should not overwrite ip_address.
     *  If we have not discovered any NIC IPs, then we overwrite the IP address
     *  If we have discovered NICs, and find that the IP address field has a value already in that list,
     *  then we would need to delete it from CI Data object, otherwise we need to update the field with what we've got in CI Data.
     */
    processIPAddressField: function(cigr) {
        if (JSUtil.nil(cigr)) // if cigr is null, then it's a new record about to be inserted.
            return;

        var existingIP = cigr.ip_address + '';
        if (JSUtil.nil(existingIP))
            return;

        var discoveredIP = this.ciData.getData()["ip_address"];
        if (existingIP == discoveredIP)
            return;

        var nics = this.ciData.getRelatedList('cmdb_ci_network_adapter', 'cmdb_ci');
        if (JSUtil.nil(nics) || nics.length == 0) {
		delete this.ciData.getData()["ip_address"];
		DiscoveryLogger.warn('Network adapter list missing, not setting ip ' + discoveredIP, this.type, this.getEccQueueId(), this.CISysID);
		return;
        }

        var ips = this.getIPv4Addresses();
        if (ips.length == 0)
            return;

        if (new ArrayUtil().contains(ips, existingIP))
            delete this.ciData.getData()["ip_address"];
    },

    /*
    *   If we got model info in the identity phase, then we're ready to roll. However, in the case when we do not, we need to
    *   stub out an "Unknown" hardware model and set it to not track CIs so sAM doesn't end up creating an asset for a CI with unknown model
    */
    processModel: function(cigr) {
        var model_id = this.ciData.getData()["model_id"];

        // If we have a sys_id for a discovered model, we're good to go; otherwise we need to stub it...
        if (JSUtil.notNil(model_id))
            return;

        // For an existing CI, if it already has a model_id, then let's not stub an unknown
        if (JSUtil.notNil(cigr) && JSUtil.notNil(cigr.model_id))
            return;

        var mm = MakeAndModelJS.fromNames("", "Unknown", "hardware");
        var grm = new GlideRecord("cmdb_model");
        if (grm.get(mm.getModelNameSysID())) {
        grm.asset_tracking_strategy = "do_not_track";
        grm.update();
        this.ciData.getData()["model_id"] = grm.sys_id;
        } else
            DiscoveryLogger.warn("Could not create model record 'Unknown'", this.type, this.getEccQueueId(), this.CISysID);

    },

    setValues: function() {
        this.values = {};
        var addxs = this.getIPv4Addresses();

        this.values.ip_addresses = addxs.join(',');
    },

    getIPv4Addresses: function() {
        // get our IPv4 addresses into the "ip_addresses" value...
        var addxs = [];
        var nics = this.ciData.getRelatedList('cmdb_ci_network_adapter', 'cmdb_ci');
        for (var i = 0; i < nics.length; i++) {
            var nic_addxs = nics[i].ip_addresses;
            if (nic_addxs)
                for (var j = 0; j < nic_addxs.length; j++) {
                    var nic_addx = nic_addxs[j];
                    if (nic_addx.ip_version == 4)
                        addxs.push(nic_addx.ip_address);
                }
            else
                addxs.push(nics[i].ip_address);
        }

        return addxs;
    },

    triggerProbes: function() {
		var probesToTrigger = [ ];
        // trigger the conditional probes attached to the given Identity sensor
        var triggeredConditionalProbes = {}; // map so that each probe is only triggered once
        DiscoverySensor.prototype.triggerProbes.call(this, prepFn, {
            'ci_sys_id': this.CISysID,
            'ecc_breadcrumbs': this.getParameter('ecc_breadcrumbs'),
            'port': this.getParameter('port'),
            'os_type': this.getParameter('os_type'),
            'protocol': this.getParameter('protocol'),
        });

        function prepFn(parms, probe) {
            var probeSysId = probe.sys_id+'';
            if (!triggeredConditionalProbes[probeSysId]) {
                triggeredConditionalProbes[probeSysId] = true;
                return true;
            }

            return false;
        }

        // Now trigger the exploration probes for the classifier ...
        var probeList = this.getParameter('triggered_probes');

        // No probes?
        if ((probeList === null) || (typeof probeList == 'undefined') || gs.nil(probeList))
            return;
        
        var probeIDs = ('' + this.getParameter('triggered_probes')).split(',');
        for (var i = 0; i < probeIDs.length; i++) {
			var probeID = probeIDs[i];
			probeID = probeID.split('$$$$');
			var probe = SncProbe.getById(probeID[0], this.values);
			if (probe === null)
				continue;
			if (probeID.length > 1) {
				probe.addParameter('pattern', probeID[1]);
				var patternGr = new GlideRecord('sa_pattern');
				if (!patternGr.get('name', probeID[1]))
					continue;

				probe.addParameter('patternId', patternGr.sys_id);
				probe.addParameter('pattern_type', patternGr.cpattern_type);
			}

            probe.addParameter('ecc_breadcrumbs', this.getEccQueueId());
            probe.addParameter('port', this.getParameter('port'));
            probe.addParameter('ci_sys_id', this.CISysID);
            probe.addParameter('os_type', this.getParameter('os_type'));    // added for pipeline
            probe.addParameter('protocol', this.getParameter('protocol'));    // added for pipeline
            probe.setMidSelectDetails(this.getParameter('mid_selector_details'));
            probe.setSource(this.getSource());

            if (this.getParameter('priority'))
                probe.setEccPriority(this.getParameter('priority'));

            if (this.getParameter('ssm_object'))
                probe.addParameter('ssm_object', this.getParameter('ssm_object'));

            var mac_address = "";
            var macAddrVerification = JSUtil.toBoolean(gs.getProperty("glide.discovery.enable_mac_address_verification", "false"));
            if (macAddrVerification && JSUtil.notNil(mac_address = this.getMacAddress()))
                probe.addParameter('mac_address',   mac_address                       );    // added for MAC address verification

            if (!this.configureTriggeredProbe(probe))
                continue;

			probesToTrigger.push(probe);
		}

		// Increment the count before we start launching probes since we're going to skip the before
		// insert BR on ecc_queue.
		var statusId = g_probe.getCorrelator();

		/*
		 * While we can do things in updateStatusStartedCount, we will have to query status again
		 * We will have the wrapping condition for now
		 *
		 * The ! is to cover both false and undefined
		 * While isOptimizedCounting is a boolean, it may not exist,
		 * therefore using == false will miss the undefined use case
		 */
		if (!this.status.scratchpad.isOptimizedCounting) {
			if (probesToTrigger.length)
				DiscoveryStatus.updateStatusStartedCount(statusId, probesToTrigger.length);

			// Setting a global variable here in the rhino context within the thread.
			// The reason is that we do not want the BR triggered by inserting probes in to the ECC queue
			// to be locking unto the status record for every single one.
			// We'll update the count at the end.
			_DO_NOT_UPDATE_STATUS_STARTED_COUNT = true;
		}
		var notLaunched = 0,
			_this = this;

		probesToTrigger.forEach(function(probe) {
            try {
                var eccQueueSysID = probe.create(_this.getAgent(), _this.getEccQueueId());
                if (JSUtil.nil(eccQueueSysID))
                    notLaunched++;
            } catch (e) {
				notLaunched++;
                try {
                    var name = probe.getName();
                    if (probeID.length > 1)
                        name = probeID[1];
                    DiscoveryLogger.warn('Exception when creating ' + name + ': ' + e.toString(), _this.type, eccQueueSysID);
                } catch (e) {
                    // Do nothing - we already tried to log and failed.
                }
            }
        });

		/*
		 * The ! is to cover both false and undefined
		 * While isOptimizedCounting is a boolean, it may not exist,
		 * therefore using == false will miss the undefined use case
		 */
		if (!this.status.scratchpad.isOptimizedCounting) {
			// Decremement started count if there were probes we expected to launch but couldn't.
			if (notLaunched)
				DiscoveryStatus.updateStatusStartedCount(statusId, -notLaunched);

            _DO_NOT_UPDATE_STATUS_STARTED_COUNT = false;
		}
    },

    /**
     * Get the MAC address for this CI.
     */
     getMacAddress: function() {
        var nics = this.ciData.getRelatedList('cmdb_ci_network_adapter', 'cmdb_ci');
        if (JSUtil.nil(nics))
            return null;

        var mac_address = "";
        for (var j = 0; j < nics.length; j++) {
            if (nics[j].mac_address) {
                mac_address = nics[j].mac_address;
                break;
            }
        }
        return mac_address;
    },

    /**
     * Configure a triggered probe before it is launched.
     * @param Probe probe Already configured and ready to fire.
     * @return boolean Return TRUE to fire this probe, FALSE to skip it.
     * @extendable Override
     */
    configureTriggeredProbe: function(probe) {
        return true;
    },

    getAdapterGateways: function(output, adapters, gwExpr) {
        var joinedOutput = output.replace(/\n\n/mg, "\n").replace(/\n\s+/mg, " ");
        var lines = joinedOutput.split(/\n/);

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            gwExpr.lastIndex = 0;
            var parts = gwExpr.exec(line);

            if (JSUtil.nil(parts))
                continue;

            for (var n in adapters)
                if (adapters[n].name == parts[2]) {
                    adapters[n].ip_default_gateway = parts[1];
                    this.ciData.data.default_gateway = parts[1];
                }
        }
    },

    addToCIData: function(adapters) {
        var nicsRL = new CIRelatedList('cmdb_ci_network_adapter', 'cmdb_ci');
        this.ciData.addRelatedList(nicsRL);
        nicsRL.addRecs(adapters);
    },

    handleError: function(errors) {
        DiscoverySensor.prototype.handleError.call(this, errors, {
            sourceName: this.type,
            lastState: 'Error',
            deviceState: DiscoverySensor.DeviceStates.REJECTED
        });
    },

    type: "DiscoveryJSONIDSensor"
});
