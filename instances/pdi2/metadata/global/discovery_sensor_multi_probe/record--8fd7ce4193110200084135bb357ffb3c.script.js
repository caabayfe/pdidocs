function(result, ciData, debug, sensor) {
	var CHASSIS_OID = 'iso.org.dod.internet.mgmt.mib-2.entityMIB.entityMIBObjects.entityPhysical.entPhysicalTable.entPhysicalEntry.entPhysicalSerialNum';
	var idutil = new IDSensorUtil();
	var serialNumber = idutil.calculateSnmpSerialNumber(result, CHASSIS_OID, null, 'SNMP - ACE');
  	idutil.addToSerialNumberTable(serialNumber, ciData);
}
