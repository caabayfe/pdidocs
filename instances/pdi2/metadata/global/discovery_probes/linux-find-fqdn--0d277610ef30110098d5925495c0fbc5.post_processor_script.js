new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {
        var fqdn = output;

        if(JSUtil.nil(fqdn))
            return;

        var pattern = /^[^.]+\.(?:[^.]+\.)+[^.]+$/;
		
        if (pattern.test(fqdn))
            current.fqdn = fqdn;
    },

    type: "ProbePostProcessor"
});
