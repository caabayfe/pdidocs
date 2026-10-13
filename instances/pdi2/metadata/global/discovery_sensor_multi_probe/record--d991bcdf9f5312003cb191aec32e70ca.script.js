function(result, ciData, debug, sensor) {
    var output = result.output;
    if (output === null || gs.nil(output))
        return;

    run(output, ciData, debug);

 
    function run(output, ciData, debug) {
        if (output.indexOf("BIG-IP") == -1)
            return;

        var ci_data = ciData.getData();

        if (ci_data.classify_params == undefined)
            ci_data.classify_params = {};

        ci_data.classify_params.bigip = true;
        ci_data.output += (" " + output);
    }

}		
