new ProbePostProcessor({

    /**
     * Runs the probe instance
     */
    process: function() {
        //Check if output is from lsof or pfiles and parse accordingly
        if (JSUtil.nil(output))
            return;
        var sliceIndex = output.indexOf('\n');
        if (sliceIndex === -1) {
            g_probe.setError('Unexpected output: ' + output);
            return;
        }
        var commandOutput = output.slice(sliceIndex + 1);
        if (output.startsWith('lsof output')) {
            // parse the results from our lsof output, leaving the result in result.current.connections...
            var lp = new LSOFParser();
            lp.parse(commandOutput);
            related_data.connections = lp.tcp;
            related_data.isValid = lp.isValid;
            related_data.error_string = lp.errorString;
        } else if (output.startsWith('pfiles output')) {
            // parse the results from our pfiles output, leaving the result in result.current.connections...
            var pfilesParser = new DiscoveryPfilesParser();
            pfilesParser.parse(commandOutput);
            related_data.connections = pfilesParser.tcp;
            related_data.isValid = pfilesParser.isValid;
            related_data.error_string = pfilesParser.errorString;
        }
    },

    type: "ProbePostProcessor"
});
