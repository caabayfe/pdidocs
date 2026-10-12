var CMDBIdentifierUtil = Class.create();
CMDBIdentifierUtil.prototype = {
    initialize: function() {},

    /* Activate/Deactivate the Identifier entry 
    @identifierEntrySysId sysid of the identifier entry
    @active set true to activate the entry and false to deactivate the entry
    **/
    setIdentifierEntryActive: function(identifierEntrySysId, active) {
        if ("boolean" != typeof(active)) {
            gs.error("CMDBIdentifierUtil.setIdentifierEntryActive(): Invalid active value '{0}' is passed, please pass boolean true/false only", active);
            return false;
        }
        var gr = new GlideRecord('cmdb_identifier_entry');
        var recordExists = gr.get(identifierEntrySysId);
        if (recordExists) {
            gr.setValue('active', active);
            if (null == gr.update()) {
                gs.error("CMDBIdentifierUtil.setIdentifierEntryActive(): Failed to update identifier entry with sysid: {0} active: {1}", [identifierEntrySysId, active]);
                return false;
            }
            return true;
        }
        gs.error("CMDBIdentifierUtil.setIdentifierEntryActive(): Failed to find an identifier entry with sysid: {0}", identifierEntrySysId);
        return false;
    },

    type: 'CMDBIdentifierUtil'
};
