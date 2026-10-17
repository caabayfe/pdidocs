var AProbe = Class.create();

AProbe.prototype = {

    initialize : function(probe) {
        this.probe = probe;
    },
    
    /**
     * Abstract function to execute the probe functionality - the derived probes should have a body for this
     */
    run : function() {
    },
        
    /**
      * Probe pass-through helper functions
      */
    createElement : function(key, value) {
        if (this.probe != null)
            return this.probe.createElement(key, value);
        else
            return null;
    },
    
    createOutputResult : function(output) {
        if (this.probe != null)
            this.probe.createOutputResult(output);
    },
    
    getParameter : function(key, defaultValue) {
        if (this.probe != null) {
			if (arguments.length >= 2)
				return this.probe.getParameter(key, defaultValue);
			return this.probe.getParameter(key, null);
		} else
            return null;
    },
    
    getIntParameter : function(key) {
        if (this.probe != null)
            return this.probe.getIntParameter(key);
        else
            return null;
    },
    
    getIntParameter : function(key, defaultValue) {
        if (this.probe != null)
            return this.probe.getIntParameter(key, defaultValue);
        else
            return null;
    },
    
    getBooleanParameter : function(key) {
        if (this.probe != null)
            return this.probe.getBooleanParameter(key);
        else
            return null;
    },

    getBooleanParameter : function(key, defaultValue) {
        if (this.probe != null)
            return this.probe.getBooleanParameter(key, defaultValue);
        else
            return null;
    },

    getAgentName : function() {
        if (this.probe != null)
            return this.probe.getAgentName();
        else
            return null;
    },

    getPayload : function() {
        if (this.probe != null)
            return this.probe.getPayload();
        else
            return null;
    },

    hasParameter : function(param) {
        if (this.probe != null)
            return this.probe.hasParameter(param);
        else
            return false;
    },

    newResult : function() {
        if (this.probe != null)
            return this.probe.newResult();
        else
            return null;
    },

    pop : function() {
        if (this.probe != null)
            this.probe.pop();
    },

    setAttribute : function(key, value) {
        if (this.probe != null)
            return this.probe.setAttribute(key, '' + value);
        else
            return null;
    },

    setCurrent : function(element) {
        if (this.probe != null)
            this.probe.setCurrent(element);
    }, 

    setError : function(error) {
        if (this.probe != null)
            this.probe.setError(error);
    },

    debug : function(msg) {
        if (this.probe != null && this.probe.isDebugging())
            ms.log('*** DEBUG: ' + msg);
    },
	
	/**
     * Returns an iterator over the set of credentials available to this MID server. If the target host has affinity
     * with any of the credentials in the set, then that credential will be the first one iterated.
     */
	getCredentials : function(type) {
		if (this.probe != null)
            return this.probe.getCredentials(type);
		else
			return null; 
	},

    type: "AProbe"
}
