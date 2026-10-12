var GoogleMapsConfig = Class.create();
GoogleMapsConfig.prototype = {
    initialize: function() {
    },

	getMapsKey: function() {
		return gs.getProperty('google.maps.key');
	},

	getGeocodingKey: function() {
		return gs.getProperty('google.maps.key.geocoding');
	},

    type: 'GoogleMapsConfig'
};
