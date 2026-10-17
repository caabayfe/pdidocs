var grDnsName = new GlideRecord('cmdb_ip_address_dns_name');
grDnsName.addQuery('ip_address', current.sys_id);
grDnsName.query();
if (grDnsName.next())
	clearMIDEnvCache();
