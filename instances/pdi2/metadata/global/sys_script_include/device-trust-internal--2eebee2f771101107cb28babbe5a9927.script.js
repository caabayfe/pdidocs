gs.include("PrototypeServer");

var Device_Trust_Internal = Class.create();
Device_Trust_Internal.prototype = {
    debugMode: false,
    LOG_SOURCE: 'DeviceTrust_Script',
    LOGGER: GlideSysLog,

    initialize: function() {
        if (gs.getProperty("glide.authenticate.debug.allow.trusted.device") == "true") {
            this.debugMode = true;
        } else {
            this.debugMode = false;
        }
    },

    process: function(args) {
        try {
			if(!args || args.length == 0) {
				this.debug('Received null or empty arguments');
				return;
			}
			this.debug('Received arguments are=' + args);
			var token = args.get('token');
			var tokenFrom = args.get('token_from');
			var isRegistration = args.get('is_registration');
            var isValidToken = this.isValidToken(token, tokenFrom, isRegistration);
			if(!isValidToken)
				this.error('Token validation failed. Check the hash and timestamp fields.');
			return isValidToken;
        } catch(e) {
			this.error(e.message);
        }
    },

    isValidToken: function(token, tokenFrom, isRegistration) {
        this.debug("Received token, " + token + ", token_from=" + tokenFrom + ', is_registration=' + isRegistration);
        return SNC.DeviceRegistrationUtils.validateToken(token, tokenFrom, isRegistration);
    },

    printDebugValues: function() {
        if (this.debugMode) {
            var headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                var aName = headerNames.nextElement();
                this.debug("HEADER: " + aName + " --> " + request.getHeader(aName));
            }

            var parmMap = request.getParameterMap();
            this.printHashTable(parmMap);
        }
    },

    printHashTable: function(hashMap) {
        var iterator = hashMap.keySet().iterator(); // Iterate on keys
        this.debug("Printing POST Parms...");
        while (iterator.hasNext()) {
            var key = iterator.next();
            var value = hashMap.get(key);
            for (var i = 0; i < value.length; i++) {
                this.debug("POST Parm '" + key + "': " + value[i]);
            }
        }
    },

    debug: function(msg) {
        if (this.debugMode) {
            this.LOGGER.info(this.LOG_SOURCE, "Device_Trust_Internal: " + msg);
        }
    },

    error: function(msg) {
        this.LOGGER.error(this.LOG_SOURCE, "Device_Trust_Internal: " + msg);
    },

    type: 'Device_Trust_Internal'
};
