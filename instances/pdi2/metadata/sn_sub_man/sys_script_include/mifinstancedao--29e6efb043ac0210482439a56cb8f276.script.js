var MifInstanceDAO = Class.create();
MifInstanceDAO.prototype = {
    initialize: function() {},

    /**
     * Get all MIF instances 
     */
    getMifInstances: function() {
        const mifInstanceGr = new GlideRecord('sn_mif_instance');
        mifInstanceGr.orderByDesc('is_prod');
        mifInstanceGr.orderBy('instance_name');
        mifInstanceGr.query();
        const result = [];
        while (mifInstanceGr.next()) {
            result.push({
                instance_name: mifInstanceGr.instance_name.toString(),
                instance_id: mifInstanceGr.instance_id.toString(),
                is_prod: mifInstanceGr.is_prod.toString(),
                instance_type_string: mifInstanceGr.is_prod ? 'Production' : 'Subproduction',
                sys_id: mifInstanceGr.sys_id.toString()
            });
        }
        return result;
    },

    type: 'MifInstanceDAO'
};
