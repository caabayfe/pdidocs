var SysStoreAppDao = Class.create();
SysStoreAppDao.prototype = {
    initialize: function() {},

    getVersion: function(pluginId) {
        const gr = new GlideRecord('sys_store_app');
        gr.addQuery('sys_code', pluginId);
        gr.query();
        if (gr.next())
            return gr.getValue('version');

        return '';
    },

    type: 'SysStoreAppDao'
};
