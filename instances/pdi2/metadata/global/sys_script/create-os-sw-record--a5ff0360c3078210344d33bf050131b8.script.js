(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var swGr = new GlideRecord('cmdb_sam_sw_install');
    swGr.addQuery('display_name', current.os);
    swGr.addQuery('version', current.os_version);
    swGr.addQuery('installed_on', current.sys_id);
    swGr.setLimit(1);
    swGr.query();
	if (!swGr.next()) {
	    swGr.setValue('display_name', current.os);
	    swGr.setValue('version', current.os_version);
	    swGr.setValue('installed_on', current.sys_id);
	    swGr.setValue('publisher', 'VMware');
	    swGr.setValue('last_scanned', new GlideDate().getValue());
	    var disco_source = 'ServiceNow';
	    var source = GlideProperties.get('glide.discovery.source_name');
	    if (source)
		disco_source = source;
		swGr.setValue('discovery_source', disco_source);
	    var sysid = swGr.insert();
	} else {
	    swGr.setValue('last_scanned', new GlideDateTime().getValue());
	    swGr.update();
	}
	
})(current, previous);
