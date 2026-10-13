new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {  
        related_data.isLikelyEc2 = false;
        
        if (JSUtil.notNil(output.Win32_ComputerSystemProduct.UUID)) {
            // Verify the retrieved value is in the standard UUID format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (Hexadecimal Characters)
            // Otherwise do nothing.
            if (!output.Win32_ComputerSystemProduct.UUID.toLowerCase().match(/[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/))
                return;
                
            // UUID format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXX (Hexadecimal Characters)
            // We only care about the first section for identifying amazon
            // Need to match for EC2XXXXX or XXXX2XEC (little-endian format) X is any hexadecimal character.
            var identifierSection = output.Win32_ComputerSystemProduct.UUID.split("-")[0].toLowerCase();
            // Check for UUID starting with ec2 (ec2XXXXX)
            if (identifierSection.startsWith('ec2'))
                related_data.isLikelyEc2 = true;
            // Check for the UUID section ending in 2Xec (little endian format: XXXX2Xec)
            else if (identifierSection.match(/2[\da-f]ec$/))
                related_data.isLikelyEc2 = true;
        }
    }
});
