var ShazzamInsights = Class.create();
ShazzamInsights.prototype = {
    initialize: function(current) {
        var discoveryStatusGr = new GlideRecord('discovery_status');
        discoveryStatusGr.addQuery('sys_id', current.sys_id);
        discoveryStatusGr.query();
        this.status = {};
        if (discoveryStatusGr.next()) {
            this.status.sysID = discoveryStatusGr.getValue("sys_id");
            this.status.scheduleID = discoveryStatusGr.getValue("dscheduler");
        } else {
            gs.info("Shazzam could not find status for: " + current.sys_id);
            return;
        }
        this.schedule = new DiscoverySchedule(this.status.scheduleID);
        this.rangeMap = [];
        this.discoveryPhaseBased = false;
        this.shazzamRecordPresent = false;
        this.portToStatus = {
            http: 'http_port',
            winrm: 'winrm_port',
            slp: 'slp_port',
            winrm_ssl: 'winrm_ssl_port',
            wmi: 'wmi_port',
            snmp: 'snmp_port',
            ssh: 'ssh_port',
            wbem: 'wbem_port',
            vmapp: 'vmapp_port',
            dns: 'dns',
            wins: 'wins'
        };
        this.XMLUtil = GlideXMLUtil;
        this.batchSize = 500;
        this.ipHostMap = {};
    },

    processShazzamInsights: function() {
        if (this.schedule.valid) {
            this.checkScheduleBehavior(); //check discovery configured as behavior
            this.populateNetworkRange(); //populate the network range from DB
        } else {
            this.populateNetworkRangeQuickDiscovery(); //populate the network range from ecc queue for Quick Discovery
        }
        this.processEccQueues(); //process the ecc queues of shazzam inputs
        this.insertShazzamSummary(); //insert the shazzam summary after all shazzam inputs processed
    },

    checkScheduleBehavior: function() {
        if (this.schedule.behaviorID != null && this.schedule.behaviorID != '') {
            var discoveryFunctionality = new GlideRecord('discovery_functionality');
            discoveryFunctionality.addQuery('active', true);
            discoveryFunctionality.addQuery('behavior', this.schedule.behaviorID);
            discoveryFunctionality.query();
            //Check whether more than one phase is configured
            this.discoveryPhaseBased = discoveryFunctionality.getRowCount() > 1;
        }
    },

    populateNetworkRange: function() {
        var grschRange = new GlideRecord('discovery_schedule_range');
        grschRange.addQuery('dscheduler', this.schedule.sysID);
        grschRange.query();
        var rangeItems = [];
        while (grschRange.next()) {
            var rangeItem = grschRange.getValue('range');
            rangeItems.push(rangeItem);
        }
        var gr = new GlideRecord('discovery_range_item');
        gr.addQuery('active', true);
        var qc = gr.addQuery('schedule', this.schedule.sysID);
        qc.addOrCondition('parent', 'IN', rangeItems.join(','));
        gr.query();
        while (gr.next()) {
            var rangeCalculation = {
                sysId: '',
                ipRange: '',
                totalIPs: 0,
                aliveIPs: 0,
                activeIPs: 0,
                deadIPs: 0,
                http: 0,
                slp: 0,
                vmapp: 0,
                wbem: 0,
                winrm: 0,
                wins: 0,
                wmi: 0,
                rangesysId: '',
                snmp: 0,
                winrm_ssl: 0,
                ssh: 0
            };
            switch (gr.getValue('type')) {
                case 'IP Network':
                    var ipRange = gr.getValue('network_ip') + '/' + gr.getValue('netmask');
                    rangeCalculation.ipRange = ipRange;
                    rangeCalculation.rangesysId = gr.getValue('sys_id');
                    this.rangeMap.push(rangeCalculation);
                    break;
                case 'IP Address Range':
                    rangeCalculation.ipRange = gr.getValue('start_ip_address') + '-' + gr.getValue('end_ip_address');
                    rangeCalculation.rangesysId = gr.getValue('sys_id');
                    this.rangeMap.push(rangeCalculation);
                    break;
                case 'IP Address List':
                    rangeCalculation.ipRange =  JSON.stringify(this.getIPList(gr.getValue('sys_id')));
                    rangeCalculation.rangesysId = gr.getValue('sys_id');
                    this.rangeMap.push(rangeCalculation);
                    break;
                default:
                    gs.warn('No IP Range Configured');
            }
        }
        var localStatus = this.status;
        this.rangeMap.forEach(function(entry) {
            var gr = new GlideRecord('shazzam_summary');
            gr.discovery_status = localStatus.sysID;
            entry.sysId = gr.insert();
        });
    },

    getIPList: function(sysID) {
        var grRangeIPs = new GlideRecord('discovery_range_item_ip');
        grRangeIPs.addQuery('item_parent', sysID);
        grRangeIPs.query();
        var rangeIPs = [];
        while (grRangeIPs.next()) {
            rangeIPs.push(grRangeIPs.getValue('ip_address'));
        }
        return rangeIPs;
    },
    processEccQueues: function() {
        var gr = new GlideRecord('ecc_queue');
        gr.addQuery('queue', 'input');
        gr.addQuery('agent_correlator', this.status.sysID);
        gr.addQuery('topic', 'Shazzam');
        gr.query();
        g_array_util = new ArrayUtil();
        while (gr.next()) {
            var doc = SncProbe.getJsonPayload(gr);
            if (!gs.nil(doc)) {
                //Writing results to the Shazzam Status Table.
                this.insertShazzamStatus(g_array_util.ensureArray(doc.result));
            }
        }
    },

    insertShazzamSummary: function() {
        var localSchedule = this.schedule;
        var localStatus = this.status;
        this.rangeMap.forEach(function(entry) {
            var gr = new GlideRecord('shazzam_summary');
            gr.addQuery('discovery_status', localStatus.sysID);
            gr.addQuery('sys_id', entry.sysId);
            gr.query();
            while (gr.next()) {
                var localTotalIPs = SNC.DiscoveryRanges.fromJSON(entry.ipRange).size;
                gr.active_ips = entry.activeIPs;
                gr.alive_ips = entry.aliveIPs;
                gr.network_range = entry.ipRange;
                gr.discovery_schedule = localSchedule.sysID;
                gr.http_ports_open = entry.http;
                gr.ip_range = entry.rangesysId;
                gr.not_reachable_ips = localTotalIPs - entry.aliveIPs;
                gr.slp_ports_open = entry.slp;
                gr.snmp_ports_open= entry.snmp;
                gr.ssh_ports_open = entry.ssh;
                gr.total_ips = localTotalIPs;
                gr.vmapp_ports_open = entry.vmapp;
                gr.wbem_ports_open = entry.wbem;
                gr.winrm_ports_open = entry.winrm;
                gr.winrm_ssl_ports_open = entry.winrm_ssl;
                gr.wins_ports_open = entry.wins;
                gr.wmi_ports_open = entry.wmi;
                gr.update();
            }
        });
    },

    insertShazzamStatus: function(results) {
        this.ipHostMap = {};
        this.getDeviceHost(results);
        for (var rst = 0; rst < results.length; rst++) {
            var result = new ShazzamResult(results[rst]);
            var ip_add = result.ip;
            var sh_status = this.discoveryPhaseBased ? this.getRecordIfExists(ip_add) : new GlideRecord('shazzam_status');
            sh_status.discovery_status = this.status.sysID;
            sh_status.ip = ip_add;
            var shazzamSummaryEntry = this.getRangeItem(ip_add);
            sh_status.shazzam_summary = shazzamSummaryEntry ? shazzamSummaryEntry.sysId : '';
            sh_status.active = result.active;
            sh_status.alive = result.alive;
            if (result.alive && shazzamSummaryEntry && !this.shazzamRecordPresent) {
                shazzamSummaryEntry.aliveIPs++;
            } else if (shazzamSummaryEntry && !this.shazzamRecordPresent) {
                shazzamSummaryEntry.deadIPs++;
            }
            if (result.active && shazzamSummaryEntry && !this.shazzamRecordPresent) {
                shazzamSummaryEntry.activeIPs++;
            }
            var cmdbCI = this.ipHostMap[ip_add];
            if (cmdbCI) {
                sh_status.host = cmdbCI;
            }
            for (var scn = 0; scn < result.scanners.length; scn++) {
                var scanner = result.scanners[scn];
                var portProbe = scanner.portProbe + '';
                var statusName = this.portToStatus[portProbe];
                sh_status[statusName] = (portProbe == 'dns' ? (scanner.result == 'resolved' ? scanner.hostName : scanner.result) : scanner.result);
                if (shazzamSummaryEntry && (scanner.result == 'open' || scanner.result == 'resolved')) {
                    shazzamSummaryEntry[portProbe]++;
                }
            }
            // Glide update API inserts new record if no record exists in the CMDB
            sh_status.update();
            // reverting the flag to false to avoid missing new IPs information
            this.shazzamRecordPresent = false;
        }
    },

    populateIPHost : function(ip_address) {
        var device_ci = new GlideRecord('discovery_device_history');
        device_ci.addQuery('source','IN',ip_address.join(','));
        device_ci.addQuery('status',this.status.sysID); 
        device_ci.addNotNullQuery('cmdb_ci');
        device_ci.query();
        while(device_ci.next()) {
            this.ipHostMap[device_ci.getValue('source')] = device_ci.getValue('cmdb_ci');
        }
    },

    getDeviceHost : function(results) {
        var ip_address = [];
        for (var resultIndex = 0; resultIndex < results.length; resultIndex++) {
            var result = new ShazzamResult(results[resultIndex]);
            var ip_add = result.ip;
            ip_address.push(ip_add);
            if (ip_address.length >= this.batchSize) {
                this.populateIPHost(ip_address);
                ip_address = [];
            }
        }
        if (ip_address.length > 0) {
            this.populateIPHost(ip_address);
            ip_address = [];
        }
    },

    getRecordIfExists: function(ip) {
        var sh_status = new GlideRecord('shazzam_status');
        sh_status.addQuery('discovery_status', this.status.sysID);
        sh_status.addQuery('ip', ip);
        sh_status.query();
        if (sh_status.next()) {
            // turning the flag to true to avoid shazam summary count multiple increments for same IP
            this.shazzamRecordPresent = true;
            return sh_status; // returning exisitng record for update
        } else {
            // returning new reference
            return new GlideRecord('shazzam_status');
        }
    },

    getRangeItem: function(ipAddress) {
        var elementEntry;
        this.rangeMap.some(function(entry) {
            if ((SNC.DiscoveryRanges.fromJSON(entry.ipRange)).contains(ipAddress)) {
                elementEntry = entry;
                return true;
            }
        });
        return elementEntry;
    },

    populateNetworkRangeQuickDiscovery: function() {
        var jsonRanges = GlideProperties.getBoolean('glide.discovery.shazzam_ranges_json', false);
        var ipRanges=[];
        if (jsonRanges) {
            ipRanges = this.getDiscoveryFullRangeJSON();
        } else {
            ipRanges = this.getDiscoveryFullRangeXML();
        }
        var localStatus = this.status;
        var localRangeMap = [];
        ipRanges.forEach(function(entry) {
            var rangeCalculation = {
                sysId: '',
                ipRange: '',
                totalIPs: 0,
                aliveIPs: 0,
                activeIPs: 0,
                deadIPs: 0,
                http: 0,
                slp: 0,
                vmapp: 0,
                wbem: 0,
                winrm: 0,
                wins: 0,
                wmi: 0,
                rangesysId: '',
                snmp: 0,
                winrm_ssl: 0,
                ssh: 0
            };
            rangeCalculation.ipRange = JSON.stringify(entry);
            var gr = new GlideRecord('shazzam_summary');
            gr.discovery_status =  localStatus.sysID;
            rangeCalculation.sysId = gr.insert();
            localRangeMap.push(rangeCalculation);
        });
        this.rangeMap = localRangeMap;
    },

    getDiscoveryFullRangeJSON: function() {
        var gr = new GlideRecord('ecc_queue');
        gr.addQuery('queue', 'input');
        gr.addQuery('agent_correlator', this.status.sysID);
        gr.addQuery('topic', 'Shazzam');
        gr.query();
        // while statement used here to avoid in case any one of the payload as null
        while (gr.next()) {
            var doc = SncProbe.getJsonPayload(gr);
            if (!gs.nil(doc)) {
                var nodeParameters  = doc.parameters.textnode_parameter;
                for(var nodeIndex in nodeParameters) {
                    var parameters = nodeParameters[nodeIndex];
                    for(var paramIndex in parameters) {
                        if(nodeParameters[nodeIndex][paramIndex]=='full_range') {
                            var parsedRange = JSON.parse(nodeParameters[nodeIndex]['#text']);
                                if(parsedRange['meta'][0]['meta']) {
                                    return parsedRange['meta'][0]['meta'];
                                } else {
                                    return parsedRange['meta'];
                                }
                            }
                        }
                    }
                }
        }
    },

    getDiscoveryFullRangeXML: function() {
        var gr = new GlideRecord('ecc_queue');
        gr.addQuery('queue', 'input');
        gr.addQuery('agent_correlator', this.status.sysID);
        gr.addQuery('topic', 'Shazzam');
        gr.query();
        // while statement used here to avoid in case any one of the payload as null
        while (gr.next()) {
            var doc = SncProbe.getJsonPayload(gr);
                if (!gs.nil(doc)) {
                    var docRange = this.XMLUtil.parse(doc['@full_range']);
                    var xmlElement = docRange.getDocumentElement();
                    var xmlIPs = [];
                    this.xmlToIPRange(this.XMLUtil.getFirstChildElement(xmlElement),xmlIPs);
                    return xmlIPs;
                }
        }
    },

    xmlToIPRange: function(e,xmlIPs) {
        var netIPStr;
        var netmkStr;
        var brat;
        if ("network".equals(e.getTagName())) {
            netIPStr = this.XMLUtil.getChildTextByTagName(e, "network_ip");
            netmkStr = this.XMLUtil.getChildTextByTagName(e, "netmask");
            xmlIPs.push(netIPStr + '/' + netmkStr);
        } else if ("ip_range".equals(e.getTagName())) {
            netIPStr = this.XMLUtil.getChildTextByTagName(e, "start_ip");
            netmkStr = this.XMLUtil.getChildTextByTagName(e, "end_ip");
            xmlIPs.push(netIPStr + '-' + netmkStr);
        } else {
            if ("ip_list".equals(e.getTagName())) {
                var ei = this.XMLUtil.childElementIterator(e);
                while (ei.hasNext()) {
                    brat = ei.next();
                    xmlIPs.push(brat);
                }
            } else if ("meta_coll".equals(e.getTagName())) {
                var el = this.XMLUtil.childElementIterator(e);
                while (el.hasNext()) {
                    brat = el.next();
                    this.xmlToIPRange(brat,xmlIPs);
                }
            }
        }
    },
    type: 'ShazzamInsights'
};
