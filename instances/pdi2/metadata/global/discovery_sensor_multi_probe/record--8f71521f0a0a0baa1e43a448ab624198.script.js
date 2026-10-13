function(result, ciData, debug, sensor) {
    var output = result.output;
    if (output === null || gs.nil(output))
        return;

    run(result, ciData, debug);

    /** 
     * output is in the format "<manufacturer>,<serial number>,<LPAR id>,<LPAR name>"
     * If LPAR does not exist, -1 is displayed for LPAR number and NULL for LPAR name. 
     * If a system is capable of LPAR, but is currently running in Symmetric Multi Processing (SMP) mode, 
     * 1 is displayed for LPAR number and NULL for LPAR name.
     *
     * https://www-01.ibm.com/support/knowledgecenter/ssw_aix_71/com.ibm.aix.cmds5/uname.htm
    */
    function run(result, ciData, debug) {
        var serialInfo = output.split(',');
        var serial = JSUtil.notNil(serialInfo[1]) ? serialInfo[1].trim() : "";
        var lparId = serialInfo[2];
        if (JSUtil.notNil(serial) && JSUtil.notNil(lparId) && lparId !== "-1")
            serial += "_" + lparId.trim();
        
        var sn =  new SncSerialNumber();
        if (sn.isValid(serial))
            addToCIData(serial);
    }

    function addToCIData(serial) {
        ciData.getData()['serial_number'] = serial;
        var sl = new CIRelatedList('cmdb_serial_number', 'cmdb_ci');
        var sr = {};
        sr[ 'serial_number_type' ] = 'system';
        sr[ 'serial_number' ]      = serial;
        sr[ 'valid' ]              = true;
        sl.addRec(sr);
        ciData.addRelatedList(sl);
    }

}
