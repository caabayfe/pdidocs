var gr = new GlideRecord('cmdb_ip_address_dns_name');
gr.addQuery('ip_address.nic.cmdb_ci', parent.sys_id);
gr.addQuery('ip_address.nic.install_status', '!=', 100);
gr.addQuery('ip_address.install_status', '!=', 100);
gr.query();
var dns_ids = [];
while (gr.next())
    dns_ids.push('' + gr.dns_name);
current.addQuery('sys_id', dns_ids);
