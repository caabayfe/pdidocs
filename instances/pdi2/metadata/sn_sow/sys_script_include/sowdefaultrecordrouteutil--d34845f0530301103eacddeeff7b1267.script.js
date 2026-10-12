var SOWDefaultRecordRouteUtil = Class.create();
SOWDefaultRecordRouteUtil.prototype = {

    PLUGIN_PLAYBOOK_EXP_CORE: 'com.glide.playbook_experience.config',

    RESULT: {
        routes: [], // Any BU specific routes can be added to this.
        relatedListRoutes: [], // Any route that should be shown only when atleast one related list is configured ex: related_list_collection.
        gFormRoutesToBeHidden: [] // if you want to hide any routes that are coming from Glide form data broker.
    },

    COMMON_ROUTES: {
        "RELATED_LIST_COLLECTION": {
            "route": "related_list_collection",
            "fields": {
                "show": true,
                "relatedListTabName": "related_list"
            },
            "label": gs.getMessage("Related records"),
            "options": {}
        },
        "PLAYBOOK": {
            "route": "sow-playbook",
            "fields": {
                "show": true
            },
            "label": gs.getMessage('Playbook'),
            "options": {}
        }
    },

    RELATED_RECORD_TAB: {
        "label": gs.getMessage("Related records"),
        "id": "sow_related_records",
        "exclusionList": null,
        "inclusionList": null
    },

    initialize: function() {},

    getRecordRoutes: function(table, sysId) {
        this.getOtherRoutes(table, sysId);
        this.getGFormRoutesToBeHidden(table, sysId);
        this.getRelatedListRoutes(table, sysId);
        this.getPlaybookRoute(table, sysId);
        return this.RESULT;
    },

    getRelatedListRoutes: function(table, sysId) {
        // Override this method for custom Related records tab implementation
        if (sysId != "-1") {
            this.RESULT.relatedListRoutes.push(this.COMMON_ROUTES.RELATED_LIST_COLLECTION);
        }
        return;
    },

    getPlaybookRoute: function(table, sysId) {
        // Override this method for custom Playbook tab implementation
        if (this.hasPlaybook(table, sysId)) {
            this.RESULT.routes.push(this.COMMON_ROUTES.PLAYBOOK);
        }
        return;
    },

    hasPlaybook: function(table, sysId) {
        if (!table || !sysId || sysId == "-1" || !this.tableHasPlaybook(table))
            return false;

        // Check if there is any process execution available for the record
        if (!GlidePluginManager.isActive(this.PLUGIN_PLAYBOOK_EXP_CORE))
            return false;

        var gr = new GlideRecord(table);
        if (!gr.get(sysId))
            return false;

        return sn_playbook.PlaybookExperience.parentRecordContainsPlaybook(gr);
    },

    tableHasPlaybook: function(table) {
        if (!table)
            return false;

        var playbookTableProperty = 'sn_sow.playbook.tables.' + table;
        var tableActivePlaybook = gs.getProperty(playbookTableProperty, 'false') + '' === 'true';
        if (tableActivePlaybook)
            return true;

        // Legacy playbook property support
        var playbookTablesProperty = gs.getProperty('sn_sow.playbook.tables', '');
        if (playbookTablesProperty !== '' && playbookTablesProperty.split(',').indexOf(table) !== -1)
            return true;

        return false;
    },

    getGFormRoutesToBeHidden: function(table, sysId) {
        this.RESULT.gFormRoutesToBeHidden.push("related_list");
        return;
    },

    getOtherRoutes: function(table, sysId) {
        return;
    },

    getListsForRelatedListTab: function(relatedLists, table, tabName) {
        return;
    },

    getRelatedListConfig: function(table, sysId) {
        var result = [];
        result.push(this.RELATED_RECORD_TAB);
        return result;
    },

    handles: function(table, sysId) {
        return true;
    },

    type: 'SOWDefaultRecordRouteUtil'
};
