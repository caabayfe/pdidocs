new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {
        if (JSUtil.nil(output))
            return;

        var o = new JSON().decode(output);
        if (JSUtil.nil(o))
            return;
        
        related_data.isEc2 = false;
        if (JSUtil.notNil(o.accountId) && JSUtil.notNil(o.region) && JSUtil.notNil(o.instanceId)) {
            related_data.isEc2 = true;
            related_data.instance_id = o.instanceId;
            related_data.region = o.region;
            related_data.account_id = o.accountId;
        }
    },

    type: "ProbePostProcessor"
});
