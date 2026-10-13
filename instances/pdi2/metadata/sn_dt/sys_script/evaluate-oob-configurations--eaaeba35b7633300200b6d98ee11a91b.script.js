(function executeRule(current, previous /*null when async*/ ) {

    if (isOOBConfig(current)) {
        g_scratchpad.isOOB = 'true';
    }
	
	function isOOBConfig(current) {
    //Microsoft translator sys_ids
    var MICROSOFT_DETECT_SYS_ID_V4 = 'a8985b387fd01210b45ae248ec8665b6';
    var MICROSOFT_TRANSLATE_SYS_ID_V4 = '219b23cd5342101026b0ddeeff7b126a';

	//ServiceNow Langauge Detection sysids
    var LDS_DETECT_SYS_ID_V4 = 'af6723f87f101210b45ae248ec8665f2';

    //Check for Microsoft OOB configuration record
    if (current.getValue('detect_sub_flow') === MICROSOFT_DETECT_SYS_ID_V4 &&
			current.getValue('translate_sub_flow') === MICROSOFT_TRANSLATE_SYS_ID_V4 &&
			current.getValue('name') === 'Microsoft' &&
			current.getValue('version') === 'v4') {
        return true;
    }
    //Check for ServiceNow OOB configuration record
    else if (current.getValue('detect_sub_flow') === LDS_DETECT_SYS_ID_V4 &&
			!current.getValue('translate_sub_flow') &&
			current.getValue('name') === 'ServiceNow' &&
			current.getValue('version') === 'v4') {
        return true;
    }
    return false;
}

})(current, previous);
