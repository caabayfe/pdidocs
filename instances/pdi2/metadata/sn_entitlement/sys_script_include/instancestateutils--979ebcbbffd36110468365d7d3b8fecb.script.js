var InstanceStateUtils = Class.create();
InstanceStateUtils.prototype = {
    initialize: function() {},

    /**
     * This function determines if the instance is an "open instance" or not.
     * 
     * @returns {bool} Returns true if the instance state is open
     */
    isInstanceOpen() {
        // HACK: This should be making use of GlideUtil.isOpenInstance() but this is currently not accessible
        //    to scoped apps. So this is a temporary hack in order to get around this limitation. This code should
        //    be corrected at the first reasonable opportounity.
        var gr = new GlideRecord('ua_instance_state');
        if (!gr.isValid())
            return false;

        gr.query();
        return gr.isValidField('state') &&
            gr.next() &&
            gr.getValue('state') === 'open';
    },

    type: 'InstanceStateUtils'
};
