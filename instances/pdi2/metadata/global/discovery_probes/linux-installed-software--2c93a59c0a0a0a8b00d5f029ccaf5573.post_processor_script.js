new ProbePostProcessor({
	
	packages: [],
	
	/**
     * Runs the probe instance
     */    
    process : function() {    
		related_data.packages = this.packages; 
		
		var lines = output.trim().split('\n');
		for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

		    if (JSUtil.nil(line))
                continue;
		   
		    var res = line.split(":");
		    var prefix = res[0].trim();
		    var value = line.substring(res[0].length+1).trim();
		   
            var eventHandler = 'on_' + prefix;
            if (this[eventHandler])
                this[eventHandler](value);
            else
                this.log('Error: Invalid prefix in install software output: ' + prefix);
        }
		
		this.pushPkg(); // Push the last package... 		
    },
	
	on_Package: function(value) {
	    this.pushPkg(); 
 	   this.name = value;	   
    },    
   
    on_Status: function(value) {
 	   this.status = true;
        var installed = /^.*ok.*installed.*$/.exec(value);
	    if (!installed)
		    this.status = false;	   
    },

    on_Maintainer: function(value) {
	    if (!this.status)
		    return;
	   
	    this.maintainer = value;
        var maintMat = /^(?:.*?)<.+?@(?:(?:.+?)\\.)*(.+?)\\.(?:(?:org)|(?:com)|(?:net))>$/.exec(value);
        if (maintMat)
            this.maintainer = maintMat[1];
    },
   
    on_Version: function(value) {
	    if (!this.status)
		    return;
	   
	    this.version = value;
    },
   
    on_Release: function(value) {   
	    if (!this.status)
		    return;
	   
        // version is now RPM %{Version}-%{Release}
        this.version += JSUtil.nil(value) ? '' : '-' + value;
    },
   
    pushPkg: function() {
 	   // If there's no package name... then we have nothing to push
	    if (JSUtil.nil(this.name))
		    return;
	   
	    // The status of pkg is not installed.. reset and return
	    if (!this.status) {  
		    this.resetPkg();
		    return;
	    }
	   
        var software = {};
        software.name = this.name;
        software.version = this.version;
        software.vendor = this.maintainer;
	   
        this.packages.push(software);
	   
	    this.resetPkg();
    },
   
    resetPkg: function() {
	    this.name = null;
	    this.version = null;
	    this.maintainer = null;
	    this.status = null
    },
	
	type: "ProbePostProcessor"
});
