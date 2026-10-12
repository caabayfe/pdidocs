var MidSettingsUtil = Class.create();
MidSettingsUtil.prototype = {
    initialize: function() {
    },
	
	/**
	* @description Get list of MID Config Parameter names
	* @returns {array} array of MID Config Parameter names, empty array if not found
	*/
	getMidConfigParamNames: function() {
		return this._getUniqueValues('ecc_agent_config', 'param_name');
	},
	
	/**
	* @description Get list of MID Property names
	* @returns {array} array of MID Property names, empty array if not found
	*/
	getMidPropertyNames: function() {
		return this._getUniqueValues('ecc_agent_property', 'name');
	},
	
	/**
	* @description Get list of MID Config Parameters which are defined as MID Properties too
	* @returns {array} array of common MID Config Parameters and properties, empty array if not found
	*/
	getCommonMidPropertyConfigParams: function() {
		var props = this.getMidPropertyNames();
		var configParams = this.getMidConfigParamNames();
		return props.filter(function(el) {
				return configParams.indexOf(el)!= -1;
			});
	},

	/**
	* @description Get the name of the settings file created by "Grab MID logs, settings and thread dump" ui action
	* @returns {String} name of the mid settings file
	*/
	getMidSettingsFileName: function(midName) {
		return midName + '_settings.json';
	},
	
	/**
	* @description Return the value of the input properties from both Global and MID-specific proeprties 
	*              for the mid server with sys_id = midSysId  	
    * @param midSysId {string} - sys_id of the Mid Server
	* @param propertyList {array} - list of properties to query their values
	* @returns {Object} an object. Including visible properties to the MID Server in propertyList with their values 
	*/
	getMidPropertyValues: function(midSysId, propertyList) {
		var domainSep = gs.getProperty("glide.sys.domain.use_record_domain_for_processes") == 'true';
		var propInfo = {};
		
		var gr = new GlideRecord('ecc_agent_property');
		gr.addEncodedQuery("ecc_agent=" + midSysId + "^OR" + "ecc_agent=NULL");
		if (domainSep) {
			var midGr = new GlideRecord('ecc_agent');
			midGr.query('sys_id', midSysId);
			midGr.query();
			midGr.next();
			gr.addDomainQuery(midGr);
		}
		gr.addQuery('name', 'IN', propertyList);
		gr.orderBy('ecc_agent');
		gr.query();
		while (gr.next()) {
			var propName = gr.name + '';
			propInfo[propName] = propInfo[propName] || {};
			propInfo[propName].value = gr.value + '';
		}
		return propInfo;
	},
	
	/**
	* @description Get unique values for the groupingAttribute column in the input table 
    * @param table {string} - name of the table to be queried
	* @param groupingAttribute {string} - name of the field that the unique values are needed
	* @returns {array} array of unique values, empty array if not found
	*/
	_getUniqueValues: function(table, groupingAttribute) {
		var uniqueValues = [];
	
		var ga = new GlideAggregate(table);
		ga.addAggregate('COUNT');
		ga.groupBy(groupingAttribute);
		ga.addHaving('COUNT','>','0'); // get only values where count is more than 1
		ga.query();
	
		while (ga.next()) {
			// check if the row is for a unique value and not for an overall count
			if(ga.getDisplayValue(groupingAttribute)){
				uniqueValues.push(ga.getDisplayValue(groupingAttribute)); // add the value to the array
			}
		}
	
		return uniqueValues;
	},
	
	
    type: 'MidSettingsUtil'
};
