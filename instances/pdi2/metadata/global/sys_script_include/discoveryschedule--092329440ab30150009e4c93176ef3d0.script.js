// Discovery class

/**
 * Encapsulates the notion of a Discovery Schedule.  Instances where isValid() returns true have the following
 * properties initialized:
 *
 * name:              name of this Discovery schedule
 * sysID:             sys_id of this Discovery schedule record
 * midSelMode:        how to select the MID Servers: 'auto_select', 'specific_mid', 'specific_cluster', or 'behavior'
 * midServerID:       sys_id of associated MID Server
 * midClusterID:      sys_id of associate MID Server cluster record
 * behaviorID:        sys_id of associated behavior
 * discover:          what to discover: 'CIs', 'IPs', or 'Nets'
 * active:            true if this Discovery schedule is active
 * midServer:         the MIDServer instance for the associated MID server
 * ranges:            a JavaScript array of IPIncludeExcludeCollection instances, one per range
 * location:          the location reference in the schedule, or null if none
 * includeAlive:      boolean, true if include alive was checked
 * logStateChanges:   boolean, true to log state changes
 * maxRun:            GlideElement of max_run parameter
 * maintenanceSource: source of IP addresses for Discovery schedule
 *
 * Tom Dilatush tom.dilatush@service-now.com
 */
var DiscoverySchedule = Class.create();

DiscoverySchedule.prototype = Object.extend(new AbstractDBObject(), {
    /*
     * Retrieves or creates the schedule record, using the given source, and initializes this instance with the
     * information in that record. If the source is a GlideRecord instance, then this method assumes it's a Discovery
     * schedule record and uses it to intialize this instance. Otherwise the source is treated as a string instance
     * containing a sysID for the desired Discovery schedule record.
     */
    initialize: function(source) {
        this.valid = false;
        var gr = this._getRecord(source, 'discovery_schedule');
        if (!gr)
            return;

        // initialize this instance...
        this.name = gr.getValue('name');
        this.sysID = gr.getValue('sys_id');
        this.midSelMethod = gr.getValue('mid_select_method');
        this.midServerID = gr.getValue('mid_server');
        this.midClusterID = gr.getValue('mid_cluster');
        this.discover = gr.getValue('discover');
        this.active = gr.getValue('active');
        this.location = gr.getValue('location');
        this.maxRun = gr.getElement('max_run');
        this.behaviorID = this.midSelectBehavior() ? gr.getValue('behavior') : null;
        this.midServer = new MIDServer(this.midServerID);
        this.useSnmpVersion = gr.getValue('use_snmp_version');
        this.shazzamBatchSize = gr.getElement('shazzam_batch_size');
        this.shazzamClusterSupport = gr.getElement('shazzam_cluster_support');
        this.includeAlive = JSUtil.getBooleanValue(gr, 'include_alive');
        this.logStateChanges = JSUtil.getBooleanValue(gr, 'log_state_changes');
        this.ranges = [];
        this.rangesUnoptimized = [];
        this.excludes = new SncIPList();
        this.rangesDB = null;
        this.webServices = [];
        this.certDiscoveryType = gr.isValidField('cert_discovery_type') ? gr.getValue('cert_discovery_type') : null;
        this.exclusionRangeTooLarge = false;
        this.rangesSet = false;
        this.rangesUnoptimizedSet = false;
        this.readCache = false;
        this.useSsmDiscovery = (gs.getProperty('glide.discovery.enable_ssm', 'false') == 'true') && ((gr.getValue('discovery_agent') + '') == 'aws_ssm');
        this.maintenanceSource = gr.getValue('maintenance_source');

        if (this.discoverWebService()) {
            this._getWebServiceAccounts();
        } else if (this.discoverCloudResources()) {
            var ldcGr = new GlideRecord('cmp_discovery_ldc_config');
            ldcGr.addQuery('discovery_schedule', this.sysID);
            ldcGr.addActiveQuery();
            ldcGr.setLimit(1);
            ldcGr.query();
            if (ldcGr.hasNext()) {
                this.valid = true;
            }
        } else if (this.discoverUrlCertificates()) {
            //check if atleast 1 url is mapped for the schedule.
            var scheduledUrls = new GlideRecord('sn_disco_certmgmt_cert_url_sched_m2m');
            scheduledUrls.addQuery('schedule', this.sysID);
            scheduledUrls.query();
            if (scheduledUrls.next())
                this.valid = true;
            else {
                var isHTTPEndpointURLEnabled = gr.isValidField('include_endpoint_https_urls') ? gr.getValue('include_endpoint_https_urls') : null;

                if (isHTTPEndpointURLEnabled == 1) {
                    //check if we have atleast one entry in cmdb_ci_endpoint_http table with valid url field.
                    var httpEndpointGR = new GlideRecord('cmdb_ci_endpoint_http');
                    httpEndpointGR.addQuery('sys_domain', gr.getValue('sys_domain'));
                    httpEndpointGR.addNotNullQuery('url');
                    httpEndpointGR.query();

                    if (httpEndpointGR.getRowCount() > 0)
                        this.valid = true;
                    else
                        gs.warn('Please make sure there are valid records in cmdb_ci_endpoint_http with proper values in URL field in order to discover certificates for the URLs from HTTP Endpoint table.');
                }
            }
        } else {
            if (this.discoverCloud() ||
                this.discoverHostless() ||
                this.discoverCaTrustCertificates() ||
                this.importCertificates()) {

                var lchrGr = new GlideRecord('discovery_pattern_launcher');
                lchrGr.addQuery('schedule', this.sysID);
                lchrGr.query();
                if (lchrGr.hasNext())
                    this.valid = true;
                else
                    this.valid = false;
            } else if (gr.discover.equals('CIs') && new CloudResourceDiscoveryUtil().hasParentCloudSchedule(this.sysID)) {
                //For VM Schedules which runs after Cloud Schedules, we will not be having the IP ranges populated in the schedule table.
                //So, Bypassing the range check for VM schedule if it has a parent cloud schedule.
                var ipList = new CloudDiscoveryScheduleConfig().getListofIPAddressesForVMSchedule(this.sysID);
                this.setRanges(ipList);
            } else {
                if (new Discovery().isValidRange(gr)) {
                    this.valid = true;
                }
            }
        }
    },

    errorsInSchedule: function() {
        if (!this.sysID)
            return false;

        if (this.midSelMethod == 'specific_cluster' && !this.midClusterID)
            return sn_i18n.Message.getMessage('global-discovery', 'This schedule has no valid MID server. Perhaps previous selection was deleted, Schedule ID: {sysId}, Schedule Name: {name}', {
                sysId: this.sysID,
                name: this.name
            });

        var excludedIpCount = countExcludedIPs(this.sysID);
        if (excludedIpCount >= 500000)
            return sn_i18n.Message.getMessage('global-discovery', 'Too Many IPs Excluded:{excludedIpCount}', {
                excludedIpCount: excludedIpCount
            });

        var v6AddressesCount = countIPs(this, function(range) {
            return range.hasV6();
        });

		if (this.midSelMethod == 'auto_select') {
			var scheduleV6ConfigNotSupportedMessage = sn_i18n.Message.getMessage('global-discovery', 'IPv6 addresses are not supported on schedules with MID auto-selection');

			if (v6AddressesCount > 0)
				return scheduleV6ConfigNotSupportedMessage;

			/*
			 * DEF0737182
			 * The reason for the below check is that v6AddressesCount is NOT accurate for auto-select
			 * The Java code is ignoring v6 addresses as part of IP optimizations
			 */
			var rangeSetsForSchedule = [];
			var rangeSetsGr = new GlideRecord('discovery_schedule_range');
			rangeSetsGr.addQuery('dscheduler', this.sysID);
			rangeSetsGr.addQuery('range.active', true);
			rangeSetsGr.query();

			while(rangeSetsGr.next())
				rangeSetsForSchedule.push(rangeSetsGr.range + '');

			var ipListsForSchedule = [];
			var ipListsGr = new GlideRecord('discovery_range_item');
			ipListsGr.addActiveQuery();
			ipListsGr.addQuery('type', 'IP Address List');
			ipListsGr.addQuery('schedule', this.sysID).addOrCondition('parent', 'IN', rangeSetsForSchedule);
			ipListsGr.query();

			while (ipListsGr.next())
				ipListsForSchedule.push(ipListsGr.sys_id + '');

			var ipItemsGr = new GlideRecord('discovery_range_item_ip');
			ipItemsGr.addQuery('item_parent', 'IN', ipListsForSchedule);
			ipItemsGr.addQuery('ip_address', 'CONTAINS', ':'); //Look for v6 only
			ipItemsGr.setLimit(1);
			ipItemsGr.query();

			if (ipItemsGr.hasNext())
				return scheduleV6ConfigNotSupportedMessage;
		}

        var ipv6Limit = +gs.getProperty('glide.discovery.schedule_ipv6_limit', 20000);

        if (v6AddressesCount > ipv6Limit)
            return sn_i18n.Message.getMessage('global-discovery', 'IP lists with IPv6 addresses can only contain {ipv6Limit} IPs but this schedule has {v6AddressesCount}',
				// Without a string conversion, the number will include ".0" in the message. E.g. 10.0
				{
					ipv6Limit: ipv6Limit + '',
					v6AddressesCount: v6AddressesCount + ''
				}
			);

        var ipTotalCount = countIPs(this);
        if (ipTotalCount > 1048576) // This is the size of a /12 network
            return sn_i18n.Message.getMessage('global-discovery', 'Schedule can only contain 1,048,576 IPs but has {ipTotalCount}', {
                ipTotalCount: ipTotalCount
            });

        function countIPs(_this, filter) {
            var total = 0,
                ranges = SNC.DiscoveryRanges.getByScheduleID(_this.sysID, null),
                cit = ranges.rangeIterator();

            while (cit.hasNext()) {
                var range = cit.next();
                if (!filter || filter(range))
                    total += range.size;
            }

            return total;
        }

        function countExcludedIPs(scheduleId) {
            return checkRangeSets(scheduleId) + checkRangeItems(scheduleId);

            // Inner functions to calculate # of Excluded IPs
            function IPNetworkSize(netmask) {
                return Math.pow(2, (32 - netmask)) - 2;
            }

            function IPAddressRangeSize(ip_range) {
                return new SncIPRangeV4().getIPRangeV4Instance(ip_range).size();
            }

            function IPAddressListSize(parent_sys_id) {
                var count = new GlideAggregate('discovery_range_item_ip');
                count.addQuery('exclude_parent', parent_sys_id);
                count.addAggregate('COUNT');
                count.query();
                var size = 0;
                if (count.next())
                    size = count.getAggregate('COUNT');
                return size;
            }

            function checkRangeSets(scheduleId) {
                var excluded_ip_count = 0;
                var scheduleRangeGr = new GlideRecord('discovery_schedule_range');
                scheduleRangeGr.addQuery('dscheduler', scheduleId);
                scheduleRangeGr.query();
                while (scheduleRangeGr.next()) {
                    var scheduleRangeId = scheduleRangeGr.getValue('range');
                    var rangeGr = new GlideRecord('discovery_range');
                    rangeGr.addQuery('sys_id', scheduleRangeId);
                    rangeGr.addActiveQuery();
                    rangeGr.query();
                    if (rangeGr.next()) {
                        var rangeItemGr = new GlideRecord('discovery_range_item');
                        rangeItemGr.addQuery('parent', scheduleRangeId);
                        rangeItemGr.addActiveQuery();
                        rangeItemGr.query();
                        while (rangeItemGr.next())
                            excluded_ip_count += getExcludeIpCount(rangeItemGr);
                    }
                }
                return excluded_ip_count;
            }

            function checkRangeItems(scheduleId) {
                var excluded_ip_count = 0;
                var rangeItemGr = new GlideRecord('discovery_range_item');
                rangeItemGr.addQuery('schedule', scheduleId);
                rangeItemGr.addActiveQuery();
                rangeItemGr.query();
                while (rangeItemGr.next())
                    excluded_ip_count += getExcludeIpCount(rangeItemGr);
                return excluded_ip_count;
            }

            function getExcludeIpCount(rangeItemGr) {
                var count = 0;
                var included_sys_id = rangeItemGr.getValue('sys_id');
                var excludedGr = new GlideRecord('discovery_range_item_exclude');
                excludedGr.addQuery('parent', included_sys_id);
                excludedGr.query();
                while (excludedGr.next()) {
                    var type = excludedGr.getValue('type');
                    if (type == 'IP Network')
                        count += IPNetworkSize(parseInt(excludedGr.getValue('netmask')));
                    else if (type == 'IP Address Range')
                        count += parseInt(IPAddressRangeSize(excludedGr.getValue('summary')));
                    else if (type == 'IP Address List')
                        count += parseInt(IPAddressListSize(excludedGr.getValue('sys_id')));
                }
                return count;
            }
        }
    },

    setRanges: function(ipList) {
        if (this.rangesSet)
            return;

        this.rangesSet = true;
        var scheduleId = this.sysID;
        var gr = this._getRecord(scheduleId, 'discovery_schedule');
        if (!gr)
            return;

        // get our ranges...
        var dr = SNC.DiscoveryRanges.getByScheduleID(scheduleId, ipList || null);
        this._setScheduleRanges(dr);
    },

    setRangesUnoptimized: function() {
        if (this.rangesUnoptimizedSet)
            return;

        this.rangesUnoptimizedSet = true;
        var scheduleId = this.sysID;
        var gr = this._getRecord(scheduleId, 'discovery_schedule');
        if (!gr)
            return;

        // get our ranges...
        var dr = SNC.DiscoveryRanges.getByScheduleIDUnoptimized(scheduleId);
        var cit = dr.rangeIterator();
        while (cit.hasNext())
            this.rangesUnoptimized.push(cit.next().asIPCollection());
    },

    _setScheduleRanges: function(ranges) {
        var cit, collection, rangeWithNoBehavior, behavior,
            optimize = true;

        this.rangesDB = ranges;
        cit = ranges.rangeIterator();
        while (optimize && cit.hasNext()) {
            collection = cit.next().asIPCollection();
            // When the collection doesn't have a behavior collection.behavior will be null, but
            // it's some weird kind of null.  typeof returns "object", but
            //    behavior == null
            // returns false.  Loose comparison to a string was the only way I found to tell
            // when behavior is null.
            if (collection.behavior && (collection.behavior != "null")) {
                if (rangeWithNoBehavior)
                    optimize = false;
                else if (!behavior)
                    behavior = collection.behavior;
                else if (behavior + '' != collection.behavior + '')
                    optimize = false;
            } else {
                if (behavior && (behavior != 'null'))
                    optimize = false;
                rangeWithNoBehavior = true;
            }
        }

        if (optimize) {
            try {
                var hosts = SNC.IPCollectionUtil.getListOfHostnames(this.rangesDB.asIPCollection());
                if (hosts.size() != 0) {
                    collection = new SNC.DiscoveryRanges(hosts).asIPCollection();
                    if (this.behaviorID)
                        collection.behavior = behavior || this.behaviorID;
                    this.ranges.push(collection);
                }
                // Passing 20 million as shazzam batch size.  I just want the ranges to be simplified, not split for Shazzam
                var optimals = SNC.IPCollectionUtil.getOptimalRanges(this.getAppName(), this.rangesDB.asIPCollection(), 20000000);
                var _this = this;
                optimals.forEach(function(optimal) {
                    optimal.getRanges().forEach(function(range) {
                        var collection = new SNC.DiscoveryRanges(range.getRange()).asIPCollection();

                        // Getting optimal ranges doesn't preserve range behavior.  This will set the schedule's
                        // behavior (if there is one) on all ranges.  Behavior on individual ranges will be lost.
                        if (_this.behaviorID)
                            collection.behavior = behavior || _this.behaviorID;

                        _this.ranges.push(collection);
                    });
                });

                return;
            } catch (e) {
                // Something went wrong with getOptimalRanges.  Fall back to the old behavior.
                // I'd like to log something here but the discovery_status hasn't been created yet
                // so I can't write a log message where the user would see it.
                gs.warn('Failed to calculate optimal ranges: ' + e.toString() + '. Using non-optimized ranges.');
            }
        }

        cit = ranges.rangeIterator();
        while (cit.hasNext())
            this.ranges.push(cit.next().asIPCollection());
    },

    _getWebServiceAccounts: function() {
        var m2mGr = new GlideRecord('dscy_sch_wb_srvc_acct_m2m');
        m2mGr.addQuery('schedule', this.sysID);
        m2mGr.query();

        if (m2mGr.hasNext()) {
            while (m2mGr.next())
                this.webServices.push(String(m2mGr.account.sys_id));
            this.valid = true;
        }
    },

    contains: function(ip) {
        // PRB1454263: If this is called from a CI schedule, then we may not have set rangesDB yet
        // so we need to call setRanges to update rangesDB before doing this contains check
        this.setRanges();
        return JSUtil.notNil(this.rangesDB) && this.rangesDB.contains(SNC.IPAddress.get(ip));
    },

    /*
     * Takes a list of ips and checks if one of the ips is part of the schedule
     *
     * ips: Array
     */
    containsAnyIp: function(ips) {
        var _this = this;
        return ips.some(function(ip) {
            return _this.contains(ip);
        });
    },

    /*
     * Get the correct behavior for the given IP address, or null if none can be found.
     *
     * ip: The string dotted-form IP address to get a behavior for.
     */
    getBehaviorForIP: function(ip) {
        this.setRanges();
        var jip = new SNC.IPAddress(ip);
        for (var i = 0; i < this.ranges.length; i++) {
            var ipiec = this.ranges[i];
            if (ipiec.contains(jip))
                return this.getBehaviorForRange(ipiec);
        }
        return null;
    },

    /*
     * Get the DiscoveryBehavior instance for the given range.
     *
     * ipiec: the IPIncludeExcludeCollection for the range
     */
    getBehaviorForRange: function(ipiec) {
        var behaviorSource = null;
        if (this.discoverIPs() || this.discoverNets() || !this.midSelectBehavior())
            behaviorSource = this.getMIDServer(ipiec);
        else
            behaviorSource = ipiec.behavior;
        return new DiscoveryBehaviorRecord(behaviorSource, this.discover);
    },

    /*
     * Adds the given IP address (in dotted form) to the list of IP addresses excluded from the ranges in this schedule.
     * This is used by DiscoveryPhaser.
     *
     * ip: the IP address (in dotted form) to exclude.
     */
    exclude: function(ip) {
        var ipa = SNC.IPAddress.get(ip);
        if (!ipa)
            return;

        this.excludes.add(ipa.getIP());
    },

    /*
     * Modifies the schedule's ranges to exclude the accumulated list of IP addresses.
     */
    finalizeExcludes: function() {
        this.setRanges();
        for (var i = 0; i < this.ranges.length; i++) {
            var meta = new SncIPMetaCollection();
            meta.add(this.excludes);
            var oldExcludes = this.ranges[i].getExclude();
            if (oldExcludes)
                meta.add(oldExcludes);
            this.ranges[i].setExclude(meta);
        }
    },

    /*
     * Get a MIDServer instance for a discovery without behaviors, first from the given range (if it is specified),
     * then from the schedule (if it is specified), and finally the default MID server if all else fails.
     *
     * ipiec: the IPIncludeExcludeCollection for the range
     */
    getMIDServer: function(ipiec) {
        // get the mid server that's in the range, if there is any...
        var midServer = null;
        var midServerName = ipiec.midServer;

        if (midServerName)
            midServer = MIDServer.getByName(midServerName);

        // if no mid server in the range, try getting the schedule's mid server...
        if (!midServer)
            midServer = this.midServer;

        // no mid server in either the range or the schedule, use the default mid server...
        if (!midServer)
            midServer = MIDServer.getDefault();

        return midServer;
    },

    discoverCIs: function() {
        return this.discover == 'CIs';
    },

    discoverIPs: function() {
        return this.discover == 'IPs';
    },

    discoverNets: function() {
        return this.discover == 'Nets';
    },

    discoverWebService: function() {
        return this.discover == 'Web Service';
    },

    discoverService: function() {
        return this.discover == 'Service';
    },

    discoverCloudResources: function() {
        return this.discover == 'Cloud Resources';
    },

    discoverCloud: function() {
        return this.discover == 'Cloud';
    },

    discoverHostless: function() {
        return this.discover == 'Hostless';
    },

    discoverUrlCertificates: function(gr) {
        return (this.discover == 'Certificates' && this.certDiscoveryType == 'url');
    },

    discoverCaTrustCertificates: function() {
        return (this.discover == 'Certificates' && this.certDiscoveryType == 'trust');
    },

    importCertificates: function() {
        return (this.discover == 'Certificates' && this.certDiscoveryType == 'import');
    },

    refreshAdm: function() {
        return this.discover == 'Processes/Connections';
    },

    midSelectAuto: function() {
        return this.midSelMethod == 'auto_select';
    },

    midSelectSpecificMid: function() {
        return this.midSelMethod == 'specific_mid';
    },

    midSelectSpecificCluster: function() {
        return this.midSelMethod == 'specific_cluster';
    },

    midSelectBehavior: function() {
        return this.midSelMethod == 'behavior';
    },

    getAppName: function() {
        return this.discoverService() ? 'ServiceMapping' : 'Discovery';
    },

    type: 'DiscoverySchedule'
});
