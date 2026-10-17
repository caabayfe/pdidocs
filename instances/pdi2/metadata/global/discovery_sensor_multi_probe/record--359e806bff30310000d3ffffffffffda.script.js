function(result, ciData, debug, sensor) {
	var CHASSIS_OID = 'iso.org.dod.internet.private.enterprises.netScaler.nsProducts.rs9000.nsSysGroup.sysHardwareSerialNumber';
	var idutil = new IDSensorUtil();
	var serialNumber = idutil.calculateSnmpSerialNumber(result, CHASSIS_OID, null, 'SNMP - Netscaler - Identity');
	idutil.addToSerialNumberTable(serialNumber, ciData);
}
