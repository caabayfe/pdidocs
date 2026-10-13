(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var userContactPreference = request.body.data;
    var userContactPreferenceSysId = userContactPreference.sys_id;
    var occup = new OnCallUserPreferences();
    var userContactPreferenceGr = new GlideRecord("on_call_user_contact_preference");
    if (!userContactPreferenceSysId) { // create new record
        if (userContactPreference.on_call_user_preference + "") {
            var ocupGr = new GlideRecord("on_call_user_preference");
            if (!ocupGr.get(userContactPreference.on_call_user_preference + ""))
                return new sn_ws_err.BadRequestError("Invalid user preference id provided");

            if (!ocupGr.canRead())
                return new sn_ws_err.BadRequestError("Security constraints prevent this operation");
        }
        userContactPreferenceGr.initialize();
        setProperties();
        userContactPreferenceGr.contact_attempt = occup.getHighestOrderContactAttempt(userContactPreference.on_call_user_preference + "") + 1;

        if (!userContactPreferenceGr.canWrite())
            return new sn_ws_err.BadRequestError("Security constraints prevent this operation");

        if (!userContactPreferenceGr.insert())
            return new sn_ws_err.BadRequestError("User contact preference creation failed");
    } else { // update the record
        if (userContactPreferenceGr.get(userContactPreferenceSysId)) {
            if (!userContactPreferenceGr.canRead())
                return new sn_ws_err.BadRequestError("Security constraints prevent this operation");

            setProperties();

            if (!userContactPreferenceGr.canWrite())
                return new sn_ws_err.BadRequestError("Security constraints prevent this operation");

            if (!userContactPreferenceGr.update())
                return new sn_ws_err.BadRequestError("User contact preference update failed");
        } else
            return new sn_ws_err.BadRequestError("Invalid user contact preference id provided");
    }
    return occup.convertUserContactPreferenceToJS(userContactPreferenceGr);

    function setProperties() {
        var channelsArray = ['devices', 'email', 'sms', 'voice', 'slack', 'mobile_notification', 'teams', 'on_call_user_preference'];
        var commTypeGr = new GlideRecord('on_call_communication_type');
        commTypeGr.query();
        while (commTypeGr.next()) {
            var typeValue = commTypeGr.getValue('type');
            if (typeValue && channelsArray.indexOf(typeValue) === -1) {
                channelsArray.push("u_" + typeValue);
            }
        }
        channelsArray.forEach(function(prop) {
            if (userContactPreference[prop] || userContactPreference[prop] === "")
                userContactPreferenceGr.setValue(prop, userContactPreference[prop] + "");
        });
    }

})(request, response);
