new DiscoverySensor({

    process: function(result) {
		var hostname = this.getParameter('source');
		if (GlideIPAddressUtil.isValid(hostname))  //skip if provided source was an IP
			return;
		
		var ipArr = JSON.parse(result);
		if (!ipArr || ipArr.length == 0)
			return;
		
		var dnsId = this.ensureDnsNameRecord(hostname);
		for (var i = 0; i < ipArr.length; i++)
			this.ensureIpAddressAndM2MRecords(ipArr[i], dnsId);
	},
	
	ensureDnsNameRecord: function(hostname) {
		var re = new GlideRecordEnsurer('cmdb_ci_dns_name', 'name');
		var collection = new Packages.java.util.ArrayList();
		var map = new Packages.java.util.HashMap();
		map.put('name', hostname);
		collection.add(map);
		var ensured = re.ensure(collection);
		
		return ''+(ensured.get(hostname).get('sys_id'));
	},

	ensureIpAddressAndM2MRecords: function(ip, dnsId) {
		var re = new GlideRecordEnsurer('cmdb_ci_ip_address', 'ip_address');
		var collection = new Packages.java.util.ArrayList();
		var map = new Packages.java.util.HashMap();
		map.put('ip_address', ip);
		collection.add(map);
		var ensured = re.ensure(collection);
		var ipId = ''+(ensured.get(ip).get('sys_id'));
		
		var m2m = new GlideRecord('cmdb_ip_address_dns_name');
		m2m.addQuery('dns_name', dnsId);
		m2m.addQuery('ip_address', ipId);
		m2m.query();
		if (!m2m.hasNext()) {
			m2m.dns_name = dnsId;
			m2m.ip_address = ipId;
			m2m.insert();
		}
	},

	type: "DiscoverySensor"
});
