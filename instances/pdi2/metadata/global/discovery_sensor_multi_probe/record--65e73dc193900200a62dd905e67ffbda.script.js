function(result, ciData, debug, sensor) {
	var CHASSIS_OID = 'iso.org.dod.internet.private.enterprises.alteon.private-mibs.aws-switch.agent.agentInfo.hardware.hwSerialNumber';	
	var idutil = new IDSensorUtil(); 
	var serialNumber = idutil.calculateSnmpSerialNumber(result, CHASSIS_OID, null, 'SNMP - Alteon');
	idutil.addToSerialNumberTable(serialNumber, ciData);
}
