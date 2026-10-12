var CMDBDataSourceUtil = Class.create();
CMDBDataSourceUtil.prototype = {
    initialize: function() {},

    // adding a new source
    addDataSource: function(source) {
        var gr = new GlideRecord('sys_choice');
        gr.addQuery('element', 'discovery_source');
        gr.addQuery('name', 'cmdb_ci');
        gr.addQuery('value', source);
        gr.query();
        if (!gr.hasNext()) {
            var grNew = new GlideRecord('sys_choice');
            grNew.initialize();
            grNew.setValue('element', 'discovery_source');
            grNew.setValue('name', 'cmdb_ci');
            grNew.setValue('value', source);
            grNew.setValue('label', source);
            if (grNew.insert()) {
                var grSCS = new GlideRecord("sys_choice_set");
                grSCS.addQuery("element", "discovery_source");
                grSCS.addQuery("name", "cmdb_ci");
                grSCS.query();
                // Check if the choice set will be replaced on upgrade. If not, it's customized, and we should update sys_update_xml
                if (grSCS.next() && !sn_collision.CollisionAPI.willBeReplacedOnUpgrade(grSCS)) {
                    var um = new GlideUpdateManager2();
                    um.saveRecord(grSCS);
                }
            } else {
                gs.error('Adding discovery source failed for: ' + source);
            }
        } else {
            gs.warn('Discovery source already exists: ' + source);
        }
    },

    type: 'CMDBDataSourceUtil'

};
