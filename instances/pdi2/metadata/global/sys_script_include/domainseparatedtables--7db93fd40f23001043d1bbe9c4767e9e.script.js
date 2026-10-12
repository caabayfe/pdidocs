var DomainSeparatedTables = Class.create();
DomainSeparatedTables.prototype = {	
	initialize: function() {
	},
	
	process : function() {
		var domainTables = GlideDomainSupport.getDomainTables();
		var tables = [];
		tables = tables.concat(this.toArray(domainTables));

		// domain table is excluded by API, but we want to include as option
		var dt = GlideDomainSupport.getDomainTable();
		tables.push(dt);

		// get extensions of DS tables, which are excluded by API
		for (var i = 0; i < domainTables.size(); i++) {
			var table = new TableUtils(domainTables.get(i));
			var ext = table.getTableExtensions();
			if (ext.size() > 0) {
				tables = tables.concat(this.toArray(ext));
			}
		}
		return tables;
	},

	// converts ArrayList (returned by java APIs) to js array
	toArray : function(arrayList) {
		var array = [];
		for (var i = 0; i < arrayList.size(); i++) {
			array.push(arrayList.get(i));
		}
		return array;
	},
	
    type: 'DomainSeparatedTables'
};
