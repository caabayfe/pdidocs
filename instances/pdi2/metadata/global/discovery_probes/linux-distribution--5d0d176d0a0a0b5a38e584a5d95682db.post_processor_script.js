new ProbePostProcessor({

    /**
     * Runs the probe instance
     */
    process : function() {
		var lowercaseOutput = output.toLowerCase();
		var versionMatch = null;

        if (this._isMatch('red hat', lowercaseOutput)) {
			if (this._isMatch('oracle', lowercaseOutput)) {
				current.os = "Linux Oracle";
				versionMatch = /release ([0-9\.]+)/.exec(lowercaseOutput);
			}
			else{
				current.os = "Linux Red Hat";
				versionMatch = /release ([0-9\.]+)/.exec(lowercaseOutput);
			}
		}
        else if (this._isMatch('fedora', lowercaseOutput)) {
            current.os = "Linux Fedora";
			versionMatch = /release ([0-9\.]+)/.exec(lowercaseOutput);
		}
        else if (this._isMatch('suse', lowercaseOutput)) {
            current.os = "Linux SuSE";
			//Sample OS version formats that are expected to match the regex are 15-SP1, 15.1, 15
			versionMatch = /version ?= ?"([0-9]+((-|.)[a-z0-9]+)*)"/.exec(lowercaseOutput);
		}
        else if (this._isMatch('centos', lowercaseOutput)) {
            current.os = "Linux CentOS";
			versionMatch = /release ([0-9\.]+)/.exec(lowercaseOutput);
		}
		else if (this._isMatch('ubuntu', lowercaseOutput)) {
			current.os = "Linux Ubuntu";
			versionMatch = /version="([0-9\.]+)/.exec(lowercaseOutput);
		}
        else {
            current.os = "GNU/Linux";
		}

		if(versionMatch && versionMatch[1])
			current.os_version = versionMatch[1].toUpperCase();
    },
	
	// Return false if name not found, or name found on line preceded by 'id_like='.
	// If present, id_like= is followed by a list of similar Linux distribution names.
	//
	// Added this method for PRB942869 fix so won't incorrectly classify a Linux server if the *release 
	// files have an ID_LIKE= line followed by a list containing a different OS names
	// AND that line appears before the line with ID=<correct OS name>.
	// Many versions of Linux don't have ID_LIKE= and ID= lines (example: Centos 6.7 doesn't have
	// them, Centos 7.0 does).
	_isMatch : function (osName, text) {
		var osIdx = text.indexOf(osName);
		if (osIdx == -1)
			return false;
		
		var lastNewlineIdx = text.lastIndexOf('\n', osIdx - 1);
		if (lastNewlineIdx == -1)
			lastNewlineIdx = 0;
		var sub = text.substring(lastNewlineIdx, osIdx);
		return sub.indexOf('id_like=') == -1;
	},

    type: "ProbePostProcessor"
});
