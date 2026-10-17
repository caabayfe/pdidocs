// Discovery

/**
 *
 * @author Aleck.Lin aleck.lin@service-now.com
 */

var DiscoveryAPDEnvSensor = Class.create();

DiscoveryAPDEnvSensor.prototype = Object.extendsObject(DiscoveryAPDSensor, {

   start: function(result) {
        this.setTriggerProbes(false);   

        this.fileType = result.config["@type"];
        if (!this._isFileType("environment"))
            return;

        var versionPath = result.config.environment.application_version_path["@path"];
	    if (JSUtil.notNil(versionPath))
            this.setTriggerProbes(true);  
	   
	    this.processVersionPath(result);
	   
        this._passParamToTriggeredProbes(result);

    },

    _passParamToTriggeredProbes: function(result) {
        var xh = new XMLHelper();
		g_probe_parameters["envResult"] = xh.toXMLStr(result);
    },
    
  type: "DiscoveryAPDEnvSensor"
});
