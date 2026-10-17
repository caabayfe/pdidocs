function(result, ciData, debug, sensor) {
	var CHASSIS_OID = 'iso.org.dod.internet.private.enterprises.rnd.rndDeviceParams.rndSerialNumber';
	var idutil = new IDSensorUtil();
	var serialNumber = idutil.calculateSnmpSerialNumber(result, CHASSIS_OID, null, 'SNMP - AppDirector');
	idutil.addToSerialNumberTable(serialNumber, ciData);
}
