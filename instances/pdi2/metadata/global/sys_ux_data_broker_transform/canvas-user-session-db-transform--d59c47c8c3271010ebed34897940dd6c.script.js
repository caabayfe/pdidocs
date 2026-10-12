function transform(input) {
    /**
     * structure the output of transform method in desired format:
     *
     * {
     *    "isLoggedIn": true,
     *    "user": {
     *      "sys_id": "6816f79cc0a8016401c5a33be04be441",
     *      "firstName": "System",
     *      "lastName": "Administrator",
     *      "fullName": "System Administrator",
	 *      "userName": "admin"
     *      "roles": ["admin"],
     *      "avatar": "c148e1d13741310042106710ce41f149.iix?t=small",
     *      "initials": "SA",
     *      "timeZone": "America/Los_Angeles",
     *      "timeFormat": "HH:mm:ss",
	 *      "dateFormat": "MM-dd-yyyy"
     *      "language": "en",
     *      "domain": "global",
     *    },
     *    "properties": {
     *      "sessionTimeout": { "value": "30" },
     *      "sessionTimeleft": { "value": "2" },
     *      "activeSessionTimeleft": { "value": "2" },
     *      "trackingEnabled": { "value": "true" },
     *      "forgetMe": { "value": "true" },
     *      "awaEnabled": { "value": "false" },
     *      "ambSessionLogout": { "value": "true" }
     *    }
     *
     * }
     **/
    /*
     * Fetches user's domain
     */
    function getUserDomain() {
        var userGr = new GlideRecord("sys_user");
        userGr.get(gs.getUserID());
        return userGr.getValue("sys_domain");
    }
	function _safelyGet(obj, dotPath) {
		if (typeof(obj) !== "object" || typeof(dotPath) !== "string") {
			envLogger.error("User transform error: invalid input " + obj, dotPath);
			return null;
		}
		var foundProp = obj;
		var path = dotPath.split(".");
		for (var i = 0; i < path.length; i++) {
			if (!foundProp[path[i]])
				return null;

			foundProp = foundProp[path[i]];
		}
		return foundProp;
	}

    function processGQLResults(appParConfigPayload, graphqlObject, presenceEncryptObj) {
        var userLoggedIn = isUserLoggedIn();
        // In the case of a guest user we retreive limited info. Do not want to log an error.
        if (!graphqlObject.data.GlideDomain_Query) {
            var partialOutput = {
				isLoggedIn: userLoggedIn
			};
			if (userLoggedIn){
				partialOutput["user"] = {
					fullName: gs.getUser().getFullName(),
					displayName: gs.getUserDisplayName(),
					sys_id: gs.getUserID(),
					impersonatingUserId: gs.getImpersonatingUserName(),
					isImpersonating: GlideImpersonate().isImpersonating(),
					dateFormat: gs.getDateFormat(),
					dateTimeFormat: gs.getDateTimeFormat()
				};
			}
			return partialOutput;
        }
        var user = graphqlObject.data.GlideDomain_Query.user,
            domain = getUserDomain();
        user["domain"] = domain;
		user["displayName"] = gs.getUserDisplayName();

		if (presenceEncryptObj.data && presenceEncryptObj.data.now) {
			user["encryptionContexts"] = presenceEncryptObj.data.now.uxf_user.encryptionContexts;
			user["presence"] = presenceEncryptObj.data.now.uxf_user.presence;
		}

		if (appParConfigPayload && appParConfigPayload.data && appParConfigPayload.data.AppPARConfig_Query && appParConfigPayload.data.AppPARConfig_Query.locale) {
			var locale = appParConfigPayload.data.AppPARConfig_Query.locale;
			user["decimalSeparator"] = locale.decimalSeparator;
			user["groupingSeparator"] = locale.groupingSeparator;
		}

        return {
            isLoggedIn: userLoggedIn,
            user: user,
            properties: {
                sessionTimeout: graphqlObject.data.GlideDomain_Query.sessionTimeout,
                sessionTimeleft: graphqlObject.data.GlideDomain_Query.sessionTimeleft,
                activeSessionTimeleft: graphqlObject.data.GlideDomain_Query.activeSessionTimeleft,
                trackingEnabled: graphqlObject.data.GlideDomain_Query.trackingEnabled,
                forgetMe: graphqlObject.data.GlideDomain_Query.forgetMe,
                awaEnabled: gs.getProperty('glide.awa.enabled', false),
                ambSessionLogout: gs.getProperty('com.glide.amb.session.logout', true)
            }
        };
    }
    function isUserLoggedIn() {
        var request = GlideTransaction.get().getRequest();
        var isUserLoggedIn = UxFrameworkScriptables.isLoggedIn(request);
		return isUserLoggedIn && isUserLoggedIn !== null ? isUserLoggedIn : false;
    }
    try {
        return processGQLResults(input.appParConfigPayload, input.graphqlOutputPayload, input.userPresenceEncryptContext);
    } catch (e) {
        gs.error('Error parsing GraphQL object', e);
    }
    return {
        isLoggedIn: isUserLoggedIn()
    };
}
