var PlaybookTabProvider = Class.create();
PlaybookTabProvider.prototype = {
    initialize: function() {},

    /**
     * Whether this provider owns the Playbook tab decision for the given table.
     * @param {string} table - The table of the record being rendered on the SRP page.
     * @returns {boolean} true if this provider should decide visibility for the table.
     */
    handlesTable: function(/* String */ table) {
        return false;
    },

    /**
     * Whether the Playbook tab should be hidden for the given record.
     * Only called when handlesTable(table) returns true.
     * @param {string} table - The record's table.
     * @param {string} sysId - The record's sys_id.
     * @returns {boolean} true to hide the tab, false to show it.
     */
    hidePlaybookTab: function(/* String */ table, /* String */ sysId) {
        return true;
    },

    type: 'PlaybookTabProvider'
};
