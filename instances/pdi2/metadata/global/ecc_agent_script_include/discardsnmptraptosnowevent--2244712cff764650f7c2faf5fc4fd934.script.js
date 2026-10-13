this.snmpEvent = SNMP_EVENT;

rtrn = this.ignoreSNMPTrapEvent();

/**
 *
 *	This function is designed to ignore certain SNMP trap events based on specific conditions.
 *	If the event's source includes 'sysDescr123', the event will be ignored, and an SNMP event will not be created.
 *	Example:
 *
 *	event = this.snmpEvent;
 *	var source = event.getSource();
 *	var des = event.getDescription();
 *	if (source.includes('sysDescr123')) {
 *		return true; // if this is true event will not be created
 *	}
 *	Add the above similar condition to this script to avoid creating snmp event
*/

function ignoreSNMPTrapEvent() {
    return false;
}
