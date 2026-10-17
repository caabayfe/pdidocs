var sys_ids = [];
var offer = new GlideRecord('service_offering_commitment');
offer.addQuery('service_offering.vendor', parent.sys_id);
offer.query();
while(offer.next())
	sys_ids.push(offer.sys_id.toString());
current.addQuery('sys_id', 'IN', sys_ids);
