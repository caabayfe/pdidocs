/**
 * Converts port types between CMDB and SMI.
 * @since fuji
 * @author roy.laurie
 */
var DiscoveryFcPortType = function(portType) {

	portType = portType || 0;               // Takes care of null, undefined, etc.
	
	if (isNaN(portType)) {
		portType = (''+portType.trim()).toLowerCase();
		this.portType = DiscoveryFcPortType._NAME_MAP[portType] ? portType : '';
	}
	else
		this.portType = DiscoveryFcPortType._SMI_CMDB_MAP[portType] || '';
};

DiscoveryFcPortType._SMI_CMDB_MAP = {
	10: 'n',
	11: 'nl',
	12: 'fnl',
	13: 'nx',
	14: 'e',
	15: 'f',
	16: 'fl',
	17: 'b',
	18: 'g'
};
		
DiscoveryFcPortType._NAME_MAP = {
	'n': 'N',
	'nl': 'NL',
	'fnl': 'F/NL',
	'nx': 'Nx',
	'e': 'E',
	'f': 'F',
	'fl': 'FL',
	'b': 'B',
	'g': 'G'
};

DiscoveryFcPortType.prototype.type = 'DiscoveryFcPortType';

DiscoveryFcPortType.prototype.getPortType = function() {
	return this.portType;
};

DiscoveryFcPortType.prototype.toString = function() {
	return DiscoveryFcPortType._NAME_MAP[this.portType] || 'Unknown';
};
