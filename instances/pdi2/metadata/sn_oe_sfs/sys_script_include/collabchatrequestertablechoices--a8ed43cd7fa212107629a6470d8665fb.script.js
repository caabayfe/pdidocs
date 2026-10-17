var CollabChatRequesterTableChoices = Class.create();
CollabChatRequesterTableChoices.prototype = {
    initialize: function() {
    },
	
    process: function() {
        var validTables = [];
        // Fetch all active records from sys_cs_collab_enabled_table
        var gr = new GlideRecord("sys_cs_collab_enabled_table");
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            validTables.push(gr.table + '');
        }

        var settingsGr = new GlideRecord("sys_cs_collab_settings");
        settingsGr.query();
        while (settingsGr.next()) {
            if (settingsGr.enable_legacy_support == true) {
                // Add interaction
                validTables.push("interaction");

                // Add all extensions of Task
                var table = new GlideTableHierarchy("task");
                var tableNames = table.getAllExtensions();
                validTables.push(...tableNames);
            }
        }
        return validTables;
    },

    type: 'CollabChatRequesterTableChoices'
};
