(function process(g_request, g_response, g_processor) {
	var isRefList = false;

    function escapeUrlParams(unsafeUrl) {
        if (!unsafeUrl)
            return "";

        if (!unsafeUrl.includes("?") && !unsafeUrl.includes("&"))
            return GlideStringUtil.escapeHTML(unsafeUrl) + "";

        // Create an object to hold the parameters
        var params = {};

        var urlArr = unsafeUrl.split("?");

        // disregard everything before ? unless there is no question mark
        var queryString = urlArr[1] || urlArr[0];
        if (queryString) {
            queryString.split("&").forEach(function(pair) {
                var keyValue = pair.split("=");
                var key = keyValue[0];
                if (keyValue.length > 1) {
                    var value = keyValue.slice(1).join("=");
                    params[decodeURIComponent(key)] = value ? GlideStringUtil.escapeHTML(decodeURIComponent(value)) + "" : "";

					if (key === "sysparm_nameofstack" && value === "reflist")
						isRefList = true;
                } else
                   params[decodeURIComponent(key)] = "";
            });
        }

        var safeUrl = "";
        Object.keys(params).forEach(function(key) {
            var delimiter = safeUrl ? "&" : "?";
            var value = params[key];
            if (value)
                safeUrl += delimiter + encodeURIComponent(key) + "=" + encodeURIComponent(value);
            else
                safeUrl += delimiter + encodeURIComponent(key);
        });
        return safeUrl;
    }

	g_response.setContentType('text/html;charset=UTF-8');

	var referrer = g_request.getParameter("sn_new_change_referrer");
	referrer = referrer ? escapeUrlParams(referrer + "") : "";

	// If interceptor disabled go straight to the change form
	if (gs.getProperty("com.snc.change_management.change_model.disable_interceptor", false) === "true") {
		g_response.sendRedirect("change_request.do" + referrer);
		return;
	}

	var modelsActive = pm.isActive("com.snc.change_management.change_model");

	// If models are active and type compatibility isn't turned on go straight to the new UI
	var baseCreateChangeUI16Url = "sn_chg_model_ui_landing.do";
	var baseNextCreateChangeUrl = "now/change-management/create-change/";

	var typeCompatibility = gs.getProperty("com.snc.change_management.change_model.type_compatibility", false) === "true";
	var polarisSystemEnabled = gs.getProperty("glide.ui.polaris.experience", false) === "true";
	var polarisUserPreference = gs.getUser().getPreference("glide.ui.polaris.use");
	var polarisEnabled = polarisUserPreference === null ? polarisSystemEnabled : (polarisSystemEnabled && (polarisUserPreference + "") === "true");
	var nextChangeCreationEnabled = gs.getProperty("com.snc.change_request.next_create_page", false) === "true";
	if (modelsActive && !typeCompatibility) {
		var createChangeUrl = baseCreateChangeUI16Url + referrer;
		if (polarisEnabled && nextChangeCreationEnabled) {
			if (referrer) {
				createChangeUrl = baseNextCreateChangeUrl + "params/referrer/" + referrer.slice(1);

				if (isRefList)
					createChangeUrl = createChangeUrl + "/isRefList/true";
			} else {
				createChangeUrl = baseNextCreateChangeUrl;

				if (isRefList)
					createChangeUrl = createChangeUrl + "params/isRefList/true";
			}
		}

		g_response.sendRedirect(createChangeUrl);
		return;
	}

	if (modelsActive && typeCompatibility && referrer === "wizard_model_redirect") {
		var createChangeUrl = polarisEnabled && nextChangeCreationEnabled ? 
			baseNextCreateChangeUrl + "params/preselected-filter/model" : 
			baseCreateChangeUI16Url;

		g_response.sendRedirect(createChangeUrl);
		return;
	}

	var snNewChgOrigin = g_request.getParameter("sn_new_chg_origin") + "";

	// If models is active and isn't hidden, redirect to the interceptor with models
	var modelHidden = gs.getProperty("com.snc.change_management.change_model.hide", false) === "true";
	var wizardRedirect = "wizard_view.do?sys_target=&sysparm_wizardAction=sysverb_new&sysparm_parent=821fa3e153a3101034d1ddeeff7b1288&";
	if (snNewChgOrigin === "module")
		wizardRedirect += "sysparm_stack=change_request_list.do";
	if (modelsActive && !modelHidden) {
		g_response.sendRedirect(wizardRedirect + (referrer ? "&" + referrer.substring(1) : ""));
		return;
	}

	// Redirect to the original interceptor page
	wizardRedirect = "wizard_view.do?sys_target=&sysparm_wizardAction=sysverb_new&sysparm_parent=8db4a378c611227401b96457a060e0f4&";
	if (snNewChgOrigin === "module")
		wizardRedirect += "sysparm_stack=change_request_list.do";
	g_response.sendRedirect(wizardRedirect + (referrer ? "&" + referrer.substring(1) : ""));
})(g_request, g_response, g_processor);
