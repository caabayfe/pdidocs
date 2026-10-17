var PDNameGenerator = Class.create();
PDNameGenerator.prototype = {
    initialize: function() {		
    },
	
	generateNameFromLabel: function(additionalQueries) {
		//Reformat label into name format
		var name = this._createLegalName(current.label);
		
		//Use GlideAggregate in order to group by names
		var ga = new GlideAggregate(current.getTableName());
		ga.addQuery("name", "STARTSWITH", name);
		
		//Add additional filters if provided
		if (additionalQueries) {
			for (var i = 0; i < additionalQueries.length; i++) {
				var field = additionalQueries[i];
				if (current.isValidField(field))
					ga.addQuery(field, current.getValue(field));
			}
		}
		ga.groupBy("name");
		ga.groupBy("sys_id");
		ga.query();
		
		this._findAndSetUniqueName(ga, name);
	},

	_findAndSetUniqueName: function(ga, name) {
		//If no rows are returned, the name is unique on its own
		var rows = ga.getRowCount();
		if (rows == 0)
			current.name = name;
		else {
			//Gather all of the names in order to determine best unique
			var names = new Packages.java.util.HashSet();
			while (ga.next())
				names.add(ga.getValue("name"));			
			
			//Append to the end of name until a unqiue name is found
			if (!names.contains(name)) {
				current.name = name;
			} else {
				var count = 1;
				name += "_";
				while (names.contains(name + count))
					count++;
				
				current.name = name + count;
			}
		}		
	},

	_createLegalName: function(label) {
		//a cleaned string- only ASCII digits, letters & '_', no starting or ending '_' nor multiple '_' in a row.
		var base_name = "_";
		var low_label = label.toLowerCase();
		low_label = low_label.replace(/^\s+|\s+$/gm,'');
		low_label = low_label.replace(/ /g, base_name);
		low_label = low_label.replace(/[\W_]+/g, base_name);
		return low_label;
	},

    type: 'PDNameGenerator'
};
