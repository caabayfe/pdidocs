var TransformMapRelatedLists = Class.create();
TransformMapRelatedLists.prototype = {
    initialize: function() {},

    getSlowScriptQuery: function(parent) {

        var sysIDs = [];
        sysIDs.push('invalid_id'); // push this not to make empty encoded query which returns everything

        // add the transform map incase it has a script
        if (parent.getValue('run_script') == '1') {
            this.addSysID(sysIDs, parent.getUniqueValue(), parent.getValue('sys_updated_on'));
        }
        var transformScripts = new GlideRecord('sys_transform_script');
        transformScripts.addQuery('map', parent.getUniqueValue());
        transformScripts.query();
        // adds the transform scripts
        while (transformScripts.next()) {
            this.addSysID(sysIDs, transformScripts.getUniqueValue(), transformScripts.getValue('sys_updated_on'));
        }
        // add source scripts
        var transformEntry = new GlideRecord('sys_transform_entry');
        transformEntry.addQuery('map', parent.getUniqueValue());
        transformEntry.addQuery('use_source_script', 'true');
        transformEntry.query();
        // adds the transform scripts
        while (transformEntry.next()) {
            this.addSysID(sysIDs, transformEntry.getUniqueValue(), transformEntry.getValue('sys_updated_on'));
        }
        // add business rules
        var tableUtils = new TableUtils(parent.target_table.toString());
        var allTables = tableUtils.getTables(); // this returns all table including the parent
        for (var j = 0; j < allTables.size(); j++) {
            var businessRules = new GlideRecord('sys_script');
            businessRules.addQuery('collection', allTables.get(j));
            businessRules.query();
            while (businessRules.next()) {
                this.addSysID(sysIDs, businessRules.getUniqueValue(), businessRules.getValue('sys_updated_on'));
            }
        }

        return this.getEncodedQuery(sysIDs, 'script_source');
    },

    getUnindexedReferenceFields: function(parent) {
        var sysIDs = [];
        sysIDs.push('invalid_id'); // push this not to make empty encoded query which returns everything
        var transformEntry = new GlideRecord('sys_transform_entry');
        transformEntry.addQuery('map', parent.getUniqueValue());
        transformEntry.query();
        // adds the transform scripts
        while (transformEntry.next()) {
            var dictionary = new GlideRecord('sys_dictionary');
            dictionary.addQuery('name', transformEntry.target_table.toString());
            dictionary.addQuery('element', transformEntry.target_field.toString());
            dictionary.addQuery('internal_type', 'reference');
            dictionary.query();
            if (dictionary.next()) {
                // this is a reference entry
                var referenceValueField = transformEntry.reference_value_field.toString();
                var referenceTable = dictionary.reference.toString();
                var td = new GlideTableDescriptor(referenceTable);
                if (GlideStringUtil.nil(referenceValueField)) {
                    // get the display column for this table and set the reference value field
                    referenceValueField = td.getDisplayName();
                }
                var indexDescriptors = td.getIndexDescriptors().values().toArray();
                var found = false;
                descriptors: for (var i in indexDescriptors) {
                    var fields = indexDescriptors[i].getFields();
                    if (fields.size() == 1 && fields.get(0) == referenceValueField) {
                        found = true;
                        break descriptors;
                    }
                }
                if (!found)
                    sysIDs.push(transformEntry.getUniqueValue());
            }
        }
        return this.getEncodedQuery(sysIDs, 'sys_id');
    },

    getEmptyReferenceFields: function(parent) {
        var sysIDs = [];
        sysIDs.push('invalid_id'); // push this not to make empty encoded query which returns everything

        var transformEntry = new GlideRecord('sys_transform_entry');
        transformEntry.addQuery('map', parent.getUniqueValue());
        transformEntry.query();
        // adds the transform scripts
        while (transformEntry.next()) {
            var dictionary = new GlideRecord('sys_dictionary');
            dictionary.addQuery('name', transformEntry.target_table.toString());
            dictionary.addQuery('element', transformEntry.target_field.toString());
            dictionary.addQuery('internal_type', 'reference');
            dictionary.query();
            if (dictionary.next()) {
                // this is a reference entry
                var referenceValueField = transformEntry.reference_value_field.toString();
                if (GlideStringUtil.nil(referenceValueField)) {
                    sysIDs.push(transformEntry.getUniqueValue());
                }
            }
        }
        return this.getEncodedQuery(sysIDs, 'sys_id');
    },

    getUnusedCoalesceFieldsForEmptyValues: function(parent) {
        var sysIDs = [];
        sysIDs.push('invalid_id'); // push this not to make empty encoded query which returns everything

        var transformEntry = new GlideRecord('sys_transform_entry');
        transformEntry.addQuery('map', parent.getUniqueValue());
        transformEntry.addQuery('coalesce', 'true');
        transformEntry.addQuery('coalesce_empty_fields', 'false');
        transformEntry.query();
        // adds the transform scripts
        while (transformEntry.next()) {
            sysIDs.push(transformEntry.getUniqueValue());
        }
        return this.getEncodedQuery(sysIDs, 'sys_id');
    },

    addSysID: function(sysIDs, sysID, lastUpdate) {
        if (this.isSeenAfterLastChange(sysID, lastUpdate)) {
            sysIDs.push(sysID);
        }
    },

    isSeenAfterLastChange: function(sysID, lastUpdate) {
        var slowScripts = new GlideRecord('sys_script_pattern');
        slowScripts.addQuery('script_source', sysID);
        slowScripts.addQuery('last', '>', lastUpdate);
        slowScripts.query();

        return slowScripts.hasNext();

    },

    getEncodedQuery: function(sysIDs, queryField) {
        var encodedQuery = '';
        for (var i = 0; i < sysIDs.length; i++) {
            if (i > 0) {
                encodedQuery = encodedQuery + '^OR';
            }
            encodedQuery = encodedQuery + queryField + '=' + sysIDs[i];
        }
        return encodedQuery;
    },


    type: 'TransformMapRelatedLists'
};
