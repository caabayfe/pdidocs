new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {

        if (JSUtil.notNil(output) && JSUtil.notNil(output.Win32_ComputerSystemProduct.UUID))
			related_data.host_object_id = output.Win32_ComputerSystemProduct.UUID.toLowerCase();
    },

    type: "ProbePostProcessor"
});
