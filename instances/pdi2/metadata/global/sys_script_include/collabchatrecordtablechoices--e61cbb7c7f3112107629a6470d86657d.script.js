var CollabChatRecordTableChoices = Class.create();
CollabChatRecordTableChoices.prototype = {
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
          var tableUtils = new global.TableUtils("task");
          var tables = tableUtils.getAllExtensions();
          var size = tables.size();
          for (var i = 0; i < size; i++) {
              var table = tables.get(i) + '';
              if (!table)
                  continue;
              if (validTables.indexOf(table) == -1)
                  validTables.push(table + '');
          }
        }
      }
      return validTables;
	},
    type: 'CollabChatRecordTableChoices'
};
