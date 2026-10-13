// Discovery
/**
 * Represents the unique query identity of a CIM instance.
 * @author roy.laurie
 */
var CimInstanceToken = Class.create();

/**
 * @param XMLObj(//cimqueryset/cimquery/result/instance) cimInstance
 * @return string e.g., CIM_ClassName{Key1='Value1',Key2='Value2'}
 */
CimInstanceToken.parse = function(instance) {
	var identity = '';
	for (var name in instance._key)
		identity += name + "='" + instance._key[name] + "',";
	
	identity = identity.substr(0, identity.length - 1); // trim trailing ,
	var query = instance._classname + '{' + identity + '}';
	return query;
};

CimInstanceToken.prototype = {
	/**
	 * @param string
	 */
    initialize: function(instance) {
		this._token = ( typeof(instance) == 'string' ? instance : CimInstanceToken.parse(instance) );
    },
	
	getHashToken: function(cimomIp) {
        return ''+Packages.org.apache.commons.codec.digest.DigestUtils.shaHex(cimomIp + ':' + this._token);
	},
	
    type: 'CimInstanceToken'
};
