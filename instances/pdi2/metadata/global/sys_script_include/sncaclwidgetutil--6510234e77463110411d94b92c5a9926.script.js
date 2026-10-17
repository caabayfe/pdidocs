var SNCACLWidgetUtil = Class.create();
SNCACLWidgetUtil.prototype = {
    initialize: function() {
        this.SP_PAGE_PATH = '/api/now/sp/page';
        this.SP_WIDGET_PATH = '/api/now/sp/widget';
        this.SP_RECTANGLE_PATH = '/api/now/sp/rectangle';
        this.DEBUG_ENABLED = gs.getProperty('glide.service_portal.widget.enforce_public_check.debug', false);
    },
    /*
		Call this from public Service Portal widget. This will help provide additional guard rails for public or unauthenticated use cases.
		Will do the following checks
		a. If the session is authenticated we return true.
		b. If glide.service_portal.widget.enforce_public_check property is set to false we revert to old behavior.
		c. If the request is invoking a widget then we check if they are in any of the below properties
		    glide.service_portal.widget.allow_list: Comma seperated widget sys_ids
			glide.service_portal.widget.table_allow_list: Comma seperated table names
		d. Disallow if did not meet above conditions
		Example Invocation: For "Simple List" public SP widget
			if (!new SNCACLWidgetUtil().hasPublicAccess('5b255672cb03020000f8d856634c9c28', options.table, ['t', 'f'], options, input)) {
				data.isValid = false;
				return;
			}
	 */
    hasPublicAccess: function(widgetSysid, tableName, param_array, options, input) {
        // Authentication check
        if (gs.isLoggedIn())
            return true;
        // Global kill switch property for widgets
        if (gs.getProperty('glide.service_portal.widget.enforce_public_check', true) == "false") {
            this.debugLogInfo("glide.service_portal.widget.enforce_public_check: " + false);
            return true; // Revert to old behavior
        }

        var requestedUrlPath = GlideTransaction.get().getURL();

        //log POST calls
        if (requestedUrlPath && (requestedUrlPath.startsWith(this.SP_RECTANGLE_PATH) || requestedUrlPath.startsWith(this.SP_WIDGET_PATH))) {
            if (gs.getProperty('glide.service_portal.api.post.log', true) == 'true') { //kill switch
                try {
                    var request = GlideTransaction.get().getRequest();
                    if (request && 'POST'.equals(request.getMethod())) { //Only for POST request
                        var result = {};
                        result.widgetSysid = widgetSysid;
                        result.requestedUrlPath = requestedUrlPath;
                        result.options = options;
                        result.input = input;
                        if (result.options && result.options.widget_parameters)
                            delete result.options.widget_parameters;
                        if (result.input && result.input.widget_parameters)
                            delete result.input.widget_parameters;
                        var params = {};
                        var paramNames = request.getParameterNames();
                        while (paramNames.hasMoreElements()) {
                            var param = paramNames.nextElement();
                            params[param + ''] = request.getParameter(param) + '';
                        }
                        result.params = params;

                        if (widgetSysid === '6aa614003b410300d6bf2479b3efc4c1' || widgetSysid === 'f9887149cb103200b2d05ea3434c9c92') {
                            gs.error('SNCACLWidgetUtil log: {0}', JSON.stringify(result));
                        } else {
                            gs.info('SNCACLWidgetUtil log: {0}', JSON.stringify(result));
                        }

                    }
                } catch (err) {
                    this.debugLogInfo('Exception: Logging for POST failed: ' + err);
                }
            }
        }

        // Verify the widget is restricted for rectangle calls or not? if yes, proceed to further validation.
        if (requestedUrlPath && !requestedUrlPath.startsWith(this.SP_WIDGET_PATH) &&
            (!requestedUrlPath.startsWith(this.SP_RECTANGLE_PATH) || !this.isWidgetRestrictedForRectangleCall(widgetSysid)))
            return true;

        // At this point we are considering SP Widget
        // and default deny unless properties are configured
        if (this.isWidgetInAllowList(widgetSysid)) {
            this.debugLogInfo("isWidgetInAllowList: " + widgetSysid);
            return true;
        }
        if (this.isTableInAllowList(tableName)) {
            this.debugLogInfo("isTableInAllowList: " + tableName);
            return true;
        }
        this.debugLogInfo('Not allowed by Widget or Table allow lists');
        return false;
    },

    isWidgetInAllowList: function(widgetSysid) {
        var widgetSysid_allow_list = GlideStringUtil.split(gs.getProperty('glide.service_portal.widget.allow_list'));
        return widgetSysid_allow_list.indexOf(widgetSysid) > -1;
    },

    isTableInAllowList: function(tableName) {
        var table_allow_list = GlideStringUtil.split(gs.getProperty('glide.service_portal.widget.table_allow_list'));
        return table_allow_list.indexOf(tableName) > -1;
    },

    isWidgetRestrictedForRectangleCall: function(widgetSysid) {
        var widgetSysid_allow_list = GlideStringUtil.split(gs.getProperty('glide.service_portal.restricted.widgets.for_rectangle_calls'));
        return widgetSysid_allow_list.indexOf(widgetSysid) > -1;
    },

    debugLogInfo: function(message) {
        if (this.DEBUG_ENABLED == "true") {
            gs.info("SNCACLWidgetUtil: " + message);
        }
    },
    type: 'SNCACLWidgetUtil'
};
