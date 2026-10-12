var GlideUtcTimeUtils = Class.create();
GlideUtcTimeUtils.prototype = {
    initialize: function() {
    },
    
    // Creates a GlideTime object in the specified time zone with the internal UTC time
    //  initialized to the glideUtcTime. If the timeZoneAsString is not recognized,
    //  the returned value is null and an ErrorMessage is added to GlideSystem.
    //  If timeZoneAsString is not set, the user's time zone is used.
    //  The returned GlideTime date may be earlier than 1970-01-01 if the timeZoneAsString
    //  is *before* UTC (e.g. "Australia/Melbourne" is 10 hours earlier).
    //  Daylight saving time is *not* applied.
    toGlideTime: function(glideUtcTime, timeZoneAsString /* optional */) {
        // fail fast if the timezone isn't recognized
        var gt = new GlideTime();
        if (timeZoneAsString) {
            var success = gt.setTimeZone(timeZoneAsString);
            if (!success) {
                gs.addErrorMessage(gs.getMessage("The selected time zone is not recognized."));
                return null;
            }
        }

        // GlideTime.setDisplayValue() needs the time in the user's format. We run this
        //  method to ensure getDisplayValue() is in the user's format (GlideUtcTime may
        //  return an internal format if the object attributes are not set correctly.)
        var utcGt = new GlideTime();
        utcGt.setTimeZone("UTC");
        utcGt.setValue(glideUtcTime.getValue());

        // Set display time in user specified time zone
        gt.setDisplayValue(utcGt.getDisplayValue());
        return gt;
    },

    type: 'GlideUtcTimeUtils'
};
