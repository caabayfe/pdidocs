function(result, ciData, debug, sensor) {
    var output = result.output;
    if (output === null || gs.nil(output))
        return;

    run(result, ciData, debug);

    function run(result, ciData, debug) {
        var serial = output.trim();
        var sn =  new SncSerialNumber();
        if (sn.isValid(serial))
            addToCIData(serial);
    }

    function addToCIData(serial) {
        ciData.getData()['serial_number'] = serial;
        var sl = new CIRelatedList('cmdb_serial_number', 'cmdb_ci');
        var sr = {};
        sr[ 'serial_number_type' ] = 'standard';
        sr[ 'serial_number' ]      = serial;
        sr[ 'valid' ]              = true;
        sl.addRec(sr);
        ciData.addRelatedList(sl);
    }

}
