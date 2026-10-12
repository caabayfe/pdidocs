(function() {
    // Create Allow IP Filter
    createIPFilterUsingIPAddressRanges("allow");

    // Create Deny IP Filter
    createIPFilterUsingIPAddressRanges("deny");
})();

function createIPFilterUsingIPAddressRanges(type) {
    // Create Allow IP Range record using all the inbound IP ranges
    var gr = new GlideRecord("ip_access");
    gr.addQuery("flow", "inbound");
    gr.addQuery("type", type);
    gr.addActiveQuery();
    gr.query();
    var ipFilterSysID = '';
    if (gr.hasNext()) {
        ipFilterSysID = createIPFilter(type);
        while (gr.next()) {
            // Create IP Range Record
            var ipRangeSysId = "";
            var ipRangeGr = new GlideRecord("sys_ip_address_range");
            ipRangeGr.addQuery("start_ip", gr.getValue('range_start'));
            ipRangeGr.addQuery("end_ip", gr.getValue('range_end'));
			ipRangeGr.addQuery("sys_ip_filter_criteria", ipFilterSysID);
            ipRangeGr.query();
            // If a IP range does not already exist with this Start IP, End IP and IPFilterSysID then insert a new record and get the sysID.
            if (!ipRangeGr.next()) {
                ipRangeGr.initialize();
                ipRangeGr.start_ip = gr.getValue('range_start');
                ipRangeGr.end_ip = gr.getValue('range_end');
				ipRangeGr.sys_ip_filter_criteria = ipFilterSysID;
				if(ipRangeGr.isValidField('description')) {
				  ipRangeGr.description = gr.getValue('description');
				}
                ipRangeSysId = ipRangeGr.insert();
            }
        }
        gs.log(type + " IP Filter Created from IP Address Control plugin, the duplicate Start IP - End IP range combinations would have been skipped.");
    } else {
        gs.log("No inbound active " + type + " IP Access Controls ranges present, skipping the migration/import.");
    }

}

// create IP Filter
function createIPFilter(type) {
    var ipFilterGr = new GlideRecord("sys_ip_filter_criteria");
    ipFilterGr.initialize();
    ipFilterGr.name = 'Is ' + type + ' Migrated IP Filter';
    ipFilterGr.description = 'IP Filter create via migration/import of Inbound IP Address Control Plugin IP Ranges';
    var ipFilterSysID = ipFilterGr.insert();
    return ipFilterSysID;
}
