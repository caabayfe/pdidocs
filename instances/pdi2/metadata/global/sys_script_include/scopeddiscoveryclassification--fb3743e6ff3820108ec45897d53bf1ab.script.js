var ScopedDiscoveryClassification = Class.create();
ScopedDiscoveryClassification.prototype = {
    initialize: function() {},
	
	/*
	* Using DiscoveryClassification.java class to classy a CI based on the map provided and returns the table value
	  form the discovery_classy table (which is the CI Type)
	* type : a String. Represents the Classification Type needed. Will be used to access to corret table. For example: windows, unix etc.
	*        For type=windows, the method will use the table discovery_classy_windows.
	* map  : an object (keys=values), the keys, values and a way to compare the input values are listed in a specific
	         Discovery Classification. For example, for Windows 2019 we have "osFullName" as the key "contains" as the operator and
			 "Server" as the value; then the map should have a key osFullName with a value that constains the word "Server" (case sensitive)
	* Retuen: The table value form the discovery_classy table (which is the CI Type)
	*/
	findCiType: function(type, map) {
		return this.find(type, map, 'table');
	},

	/*
	* This method using DiscoveryClassification.java class to classy a CI based on the map provided and returns a value from
	  the matched record.
	* type : a String. Represents the Classification Type needed. Will be used to access to corret table. For example: windows, unix etc.
	*        For type=windows, the method will use the table discovery_classy_windows.
	* map  : an object (keys=values), the keys, values and a way to compare the input values are listed in a specific
	         Discovery Classification. For example, for Windows 2019 we have "osFullName" as the key "contains" as the operator and
			 "Server" as the value; then the map should have a key osFullName with a value that constains the word "Server" (case sensitive)
	* value: The value requested from the GlideRecord of discovery_classy table
	* Retuen: The value requested. if not found returns an empty string.
	* 
	*/
    find: function(type, map, value) {
        var dc = new SncDiscoveryClassification();
		if (!type)
			type = 'discovery_classy';
		
        if (dc.find(type, map)) {
            var cl = dc.getClassificationRecord();
			if (cl)
				return cl.getValue(value);
        }
		
		return "";
    },

    type: 'ScopedDiscoveryClassification'
};
