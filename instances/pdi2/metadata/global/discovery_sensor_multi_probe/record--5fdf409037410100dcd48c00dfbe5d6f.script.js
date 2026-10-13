function(result, ciData, debug, sensor) {
	var CHASSIS_OID = 'iso.org.dod.internet.private.enterprises.f5.bigipTrafficMgmt.bigipSystem.sysPlatform.sysGeneral.sysGeneralChassisSerialNum';
	var idutil = new IDSensorUtil();
	var serialNumber = idutil.calculateSnmpSerialNumber(result, CHASSIS_OID, null, 'SNMP - F5 BIG-IP - Identity');
	idutil.addToSerialNumberTable(serialNumber, ciData);
}
