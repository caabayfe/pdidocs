var snAJAXGeoPointUtility = Class.create();

snAJAXGeoPointUtility.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    process: function () {
        if (this.getName() == 'getUnits')
            return this.getUnits();

        if (this.getName() == 'getTables')
            return this.getTables();
    },

    getUnits: function () {
        return JSON.stringify(this.getUnitsNative());
    },

	getUnitsNative: function() {
		return [{"name":"meters", "display_value": sn_i18n.Message.getMessage("com.glide.geopoint", "meters{?measure of distance}"), "abbreviation" : "m"},
        {"name":"kilometers", "display_value": sn_i18n.Message.getMessage("com.glide.geopoint", "kilometers{?measure of distance}"), "abbreviation" : "km"},
        {"name":"feet", "display_value": sn_i18n.Message.getMessage("com.glide.geopoint", "feet{?measure of distance}"), "abbreviation" : "ft"},
        {"name":"miles", "display_value": sn_i18n.Message.getMessage("com.glide.geopoint", "miles{?measure of distance}"), "abbreviation" : "mi"}
        ];
	},

    getTablesNative: function () {
        if (!gs.isLoggedIn())
            return [];
        
        //top-level tables with geo_point fields
        var tables = [];

		//until we expand to add a reference-select in the filter for finding
		//all records with a point within a distance of a specific record's point
		//(a probable use-case for cmn_location) just don't do anything if someone calls us
		return tables;

        //this includes the full hierarchies of the top-level tables
        var allTablesWithLabels = {};
        
        //to see if we have dupe labels and to sort
        var allLabelsWithTables = {};
        var appendNameToLabel = false;
        
        //so we only visit a table in a hierarchy once (if a table has multiple geo_points)
        var visited = {};

        //will return table:label tuples to client
        var answer = [];

        var gr = new GlideRecord("sys_dictionary");
        gr.addQuery("internal_type", "geo_point");
        gr.orderBy("name");
        gr.query();

        while (gr.next())
            tables.push(gr.getValue("name"));

        tables.forEach(function(table) {

            if (gs.nil(table))
                return;
            
            if (visited.hasOwnProperty(table))
                return;
            
            visited[table] = true;

            if (table.startsWith("sysx") || table.startsWith("v_") || table.startsWith("var__m"))
                return;

            var td = GlideTableDescriptor.get(table);
            if (!td.isValid())
                return;

            var gdo = new GlideDBObjectManager();
            var chillins = gdo.getAllExtensions();
            chillins.forEach(function(child_table) {
                visited[child_table] = true;
                var label = GlideTableDescriptor.get(child_table).getLabel();
                if (allLabelsWithTables.hasOwnProperty(label))
                    appendNameToLabel = true;
                
                allLabelsWithTables[label] = child_table;
                allTablesWithLabels[child_table] = [label];
            });
        });

        //append tablename if necessary
        if (appendNameToLabel)
            allLabelsWithTables = {};
            Object.keys(allTablesWithLabels).forEach(function(tableName) {
                var newLabel = allTablesWithLabels[tableName] + ' [' + tableName + ']';
                allTablesWithLabels[tableName] = newLabel;
                allLabelsWithTables[newLabel] = tableName;
            });
        
        //sort by label
        Object.keys(allLabelsWithTables).sort().forEach(function(key) {
            answer.push({"label" : key, "table" : allLabelsWithTables[key]});
        });

        return answer;
    },

	getTables: function() {
		return JSON.stringify(this.getTablesNative());
	},
  
    isPublic: function () {
        return false;
    }
});
