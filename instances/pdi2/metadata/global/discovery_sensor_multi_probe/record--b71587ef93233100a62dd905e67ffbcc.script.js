function(result, ciData, debug, sensor) {
	var CHASSIS_OID = 'iso.org.dod.internet.private.enterprises.a10.a10Mgmt.axMgmt.axSystem.axSysInfo.axSysSerialNumber';
	var idutil = new IDSensorUtil();
	var serialNumber = idutil.calculateSnmpSerialNumber(result, CHASSIS_OID, null, 'SNMP - A10');
	idutil.addToSerialNumberTable(serialNumber, ciData);
}
