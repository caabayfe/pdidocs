var PageTypeChoiceTables = Class.create();
PageTypeChoiceTables.prototype = {
    initialize: function() {},

    process: function() {
        return ["sp_portal", "sys_ui_page", "sys_ux_page_registry"];
    },

    type: 'PageTypeChoiceTables'
};
