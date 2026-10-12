(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);

    function updateExtensionPoint() {
        const {
			sys_id: sysId,
            app_shell,
            component = '',
            type,
            controller,
            controller_dependencies,
            name,
            description
        } = request.body.data;

		if (!sysId || (sysId.trim && sysId.trim() === '')) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_EXTENSION_POINT_ID);
        }

        // Check for PC name
        if (!name || (name.trim && name.trim() === '')) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_EXTENSION_POINT_NAME);
        }

        // If Type is Viewport, Component must be an empty string ("blank", not null)
        if (type && type === BuilderToolkitConstants.EXTENSION_POINT.TYPE.VIEWPORT && component && component !== '') {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_EXTENSION_POINT_TYPE_VIEWPORT_NO_COMPONENT);
        } else if (!type && (!component || (component.trim && component.trim() === ''))) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_EXTENSION_POINT_COMPONENT);
        }

        if (!app_shell || (app_shell.trim && app_shell.trim() === '')) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_EXTENSION_POINT_APPSHELL);
        }

        // For controller / controller dependency, one must be present
        if ((!controller_dependencies || (controller_dependencies.length === 0)) &&
            (!controller || (!controller.trim && controller.trim() === ''))) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_EXTENSION_POINT_CONTROLLER);
        }

        const result = new ExtensionPoint().updateRecord({
            sysId,
			app_shell,
            component,
            type,
            controller,
            controller_dependencies,
            name,
            description
        });
        if (result === false) {
            apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_EXTENSION_POINT);
        } else {
            apiHelper.respondSuccesfully({
                extensionPointSysID: result
            });
        }

    }
    apiHelper.execute(updateExtensionPoint);

})(request, response);
