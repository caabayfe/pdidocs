gs.include("PrototypeServer");

var Device_Trust_Custom = Class.create();
Device_Trust_Custom.prototype = Object.extend(new Device_Trust_Internal(), {
    initialize: function() {
        Device_Trust_Internal.prototype.initialize.call(this);
    },

    /*
    process: function(args) {
        try {
            if (!args || args.length == 0) {
                this.debug('Received null or empty arguments');
                return;
            }
            this.debug('Received arguments are=' + args);
            var token = args.get('token');
            var tokenFrom = args.get('token_from');
            var isRegistration = args.get('is_registration');
            var isValidToken = this.isValidToken(token, tokenFrom, isRegistration);
            if (!isValidToken)
                this.error('Token validation failed. Check the hash and timestamp fields.');

            // Log the events.
            SNC.DeviceRegistrationUtils.genrateDeviceEventFromScript(token, isRegistration, isValidToken);
            return isValidToken;
        } catch (e) {
            this.error(e.message);
        }
    },
	*/

    type: 'Device_Trust_Custom'
});
