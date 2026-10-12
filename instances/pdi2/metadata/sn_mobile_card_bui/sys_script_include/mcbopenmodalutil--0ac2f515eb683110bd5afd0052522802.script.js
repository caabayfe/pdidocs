var McbOpenModalUtil = Class.create();
McbOpenModalUtil.prototype = {
    initialize: function() {},

    type: 'McbOpenModalUtil',

    _compareName: function(a, b) {
        var aLower = a.name.toLowerCase();
        var bLower = b.name.toLowerCase();
        if (aLower < bLower) {
            return -1;
        }
        if (aLower > bLower) {
            return 1;
        }
        return 0;
    },

    _removeDuplicatesBySysId: function(arrayWithDuplicates) {
        var returnedSysIds = [];

        return arrayWithDuplicates.filter(function(item) {
            return returnedSysIds.indexOf(item.sysId) >= 0 ?
                false :
                returnedSysIds.push(item.sysId);
        });
    },

    _getTableRecordCount: function(tableName) {
        // GlideAggregate.addAggregate("COUNT") & GlideRecordSecure.getRowCount()
        // don't check for ACL canRead() on the row level, only the table level.
        var grs = new GlideRecordSecure(tableName);
        grs.query();
        var counter = 0;
        while (grs.next()) {
            counter++;
        }
        return counter;
    },

    _getApplications: function(tableName) {
        var distinctApplications = [];
        var glideAggregate = new GlideAggregate(tableName);
        glideAggregate.groupBy("sys_scope");
        glideAggregate.addAggregate("count");
        glideAggregate.query();
        while (glideAggregate.next()) {
            var sysId = String(glideAggregate["sys_scope"]);
            var glideRecord = new GlideRecordSecure("sys_scope");
            if (glideRecord.get(sysId) && glideRecord.canRead()) {
                var name = glideRecord.getDisplayValue();
                distinctApplications.push({
                    sysId: sysId,
                    name: name
                });
            }
        }
        return distinctApplications.sort(this._compareName);
    },

    _getApplets: function() {
        var distinctApplets = [];

        // All list screens are an applet
        var listScreenGr = new GlideRecordSecure("sys_sg_list_screen");
        listScreenGr.query();
        while (listScreenGr.next() && listScreenGr.canRead()) {
            distinctApplets.push({
                sysId: listScreenGr.getUniqueValue(),
                name: listScreenGr.getDisplayValue(),
                table: "sys_sg_list_screen",
                application: listScreenGr.getValue("sys_scope"),
            });
        }

        // All map screens are an applet
        var mapScreenGr = new GlideRecordSecure("sys_sg_map_screen");
        mapScreenGr.query();
        while (mapScreenGr.next() && mapScreenGr.canRead()) {
            distinctApplets.push({
                sysId: mapScreenGr.getUniqueValue(),
                name: mapScreenGr.getDisplayValue(),
                table: "sys_sg_map_screen",
                application: mapScreenGr.getValue("sys_scope"),
            });
        }

        // All stand alone forms are an applet
        // a form is "stand alone" if there are no master items that
        // have a reference to the form via sys_sg_master_item.embedded_screen
        var masterItemGr = new GlideRecordSecure("sys_sg_master_item");
        masterItemGr.addNotNullQuery("embedded_screen");
        masterItemGr.query();
        var formSysIdsToExclude = [];
        while (masterItemGr.next()) {
            formSysIdsToExclude.push(masterItemGr.getValue("embedded_screen"));
        }

        var formScreenGr = new GlideRecordSecure("sys_sg_form_screen");
        formScreenGr.query();
        while (formScreenGr.next() && formScreenGr.canRead()) {
            var formSysId = formScreenGr.getUniqueValue();
            if (formSysIdsToExclude.indexOf(formSysId) === -1)
                distinctApplets.push({
                    sysId: formScreenGr.getUniqueValue(),
                    name: formScreenGr.getDisplayValue(),
                    table: "sys_sg_form_screen",
                    application: formScreenGr.getValue("sys_scope"),
                });
        }

        return this._removeDuplicatesBySysId(distinctApplets).sort(this._compareName);
    },
};
