new DiscoverySensor({
    prepare: function() {
        this.status = new DiscoveryStatus(agent_correlator);
        this.midServer = MIDServer.getByName(this.getAgent());

		this.device = new GlideRecord('cmdb_ci');
		if (g_device.getCmdbCi())
			this.device.get('sys_id', g_device.getCmdbCi());
    },
    
    /*
     * Invoked once for each "result" tag in the DNS results (there is one result tag for every IP 
     * address scanned).  We protect this method with a try/catch so that a problem in a single 
     * result doesn't abort the entire DNS sensor...
     */
    process: function(sensorResult) {
        try {
            this.process_inner(sensorResult);
        }
        catch (e) {
            var result = new ShazzamResult(sensorResult);
            var errMsg = 'Exception in DNS with result from IP ' + result.ip + '; ' + e;
            DiscoveryLogger.warn(errMsg, 'DNS', this.getEccQueueId(), null);
            if (g_device) 
                g_device.issue();
        }
    },
    
    process_inner: function(sensorResult) {
        var ip = '' + sensorResult['@ip_address'];
        var result = sensorResult['@result'];
        var names = sensorResult.name;

        if (result != 'resolved')
            return;

        if (JSUtil.nil(names))
            return;

        names = names.split(',');
        if (names.length < 1)
            return;

		if (ip == ''+this.device.ip_address) {
			this.device.fqdn = names[0];
			var hn = new HostnameJS();
			hn.format(names[0]);
			var dname = hn.getDomainName();
			if (dname)
				this.device.dns_domain = dname;
			this.device.update();
		}

        var ip_sys_id = this.getIPAddresses(ip, names[0]);
        if (ip_sys_id == null)
            return;

        var ids = this.getDNSNames(names, ip);

        this.reconcile(ids, ip_sys_id);
    },
    
    /*
     *  We look at the IP Address table and find the entry (or entries) that not only match the input ip
     *  but also check to see if the IP is associated with the NIC that belongs to this particular device.
     *  Imagine a DHCP environment, we could have duplicate IPs.
     *
     *  We also want to check the install_status because we could potentially have a retired NIC that
     *  still contains an IP address that's the same as an installed one. 
     */
    getIPAddresses: function(ip, name) {
        var ip_sys_id = null;
        var ip_gr = new GlideRecord('cmdb_ci_ip_address');
        ip_gr.addQuery('ip_address', ip);
        ip_gr.addQuery('nic.cmdb_ci', '' + g_device.getCmdbCi());
        ip_gr.query();
        while (ip_gr.next()) {
            ip_sys_id = ip_gr.sys_id.toString();
            ip_gr.fqdn = name;
            ip_gr.update();
        }

        return ip_sys_id;
    },

    getDNSNames: function(names, ip) {
        // build a list of maps of DNS name record entries...
        var dns_recs = new Packages.java.util.ArrayList();
        for (var i = 0; i < names.length; i++) {
            var map = new Packages.java.util.HashMap();
            map.put('name', names[i]);
            map.put('agent', this.midServer.name);
            map.put('ip_address', ip);
            dns_recs.add(map);
        }

        // ensure that all the dns names we discovered are in the database...
        var re = new GlideRecordEnsurer('cmdb_ci_dns_name', 'name');
        re.ensure(dns_recs);
        
        // reconcile the m2m records...
        return this.getDNSNameIDs(dns_recs);
    },

    getDNSNameIDs: function(dns_recs) {
        var dns_ids = {};
        var it = dns_recs.iterator();
        while (it.hasNext()) {
        var dns_rec = it.next();
            var id = '' + dns_rec.get('sys_id');
            if (!id)
                continue;
            
            dns_ids[id] = true;
        }
        return dns_ids;
    },

    reconcile: function(ids, ip_sys_id) {
        var gr = new GlideRecord('cmdb_ip_address_dns_name');
        gr.addQuery('ip_address', ip_sys_id);
        gr.query();
        while (gr.next()) {
            var db_id = '' + gr.getValue('dns_name');
            if (ids[db_id])
                delete ids[db_id];
            else
                gr.deleteRecord();
        }
        
        for (var id in ids) {
            gr.setValue('dns_name', id);
            gr.setValue('ip_address', ip_sys_id);
            gr.insert();
        }
    },

    /*
     * Overriding DiscoverySensor.save(), because we don't need to save anything here...
     */
    save: function() {  
    },

    type: "DiscoverySensor"
});
