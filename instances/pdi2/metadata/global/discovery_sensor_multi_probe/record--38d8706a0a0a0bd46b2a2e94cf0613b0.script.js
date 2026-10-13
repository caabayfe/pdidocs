function(ciData, debug, sensor) {

    var serials = related_data.serials;
    if (JSUtil.nil(serials))
        return;

    run(serials, ciData, debug);

    function run(serials, ciData, debug) {
        var validSerials = [];
        for (var i=0; i<serials.length; i++) {
            var serial = serials[i];
			var sn =  new SncSerialNumber();
			if (sn.isValid(serial.value))
               validSerials.push(serial);
        }

		addToCIData(validSerials);
    }

    function addToCIData(validSerials) {
        if (validSerials.length === 0)
            return;

        var sl = new CIRelatedList('cmdb_serial_number', 'cmdb_ci');
        validSerials.forEach(function(serial) {
            ciData.getData()['serial_number'] = serial['value'];
            var sr = {};
            sr[ 'serial_number_type' ] = serial['type'];
            sr[ 'serial_number' ]      = serial['value'];
            sr[ 'valid' ]              = true;
            sl.addRec(sr);
        });

        ciData.addRelatedList(sl);
    }
}
