var gr = new GlideRecord('cmdb_ip_address_dns_name');
gr.addQuery('ip_address.nic.install_status', '!=', 100); // For some reason it's important this goes first. I noticed that longer dotted query needs to go first before the shorter ones. Very odd.
gr.addQuery('ip_address.nic', parent.sys_id);
gr.addQuery('ip_address.install_status', '!=', 100);
gr.query();
var dns_ids = [];
while (gr.next())
    dns_ids.push('' + gr.dns_name);
current.addQuery('sys_id', dns_ids);
