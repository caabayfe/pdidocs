(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
        const noDomain = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN, false);
        if (!sysId) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_EXPERIENCE_FOUND);
        }
        const adminPanelID = apiHelper.getBodyParam('adminPanelId', false);
        const footer = apiHelper.getBodyParam('footer', false);
        const general = apiHelper.getBodyParam('general', false);
        const menu = apiHelper.getBodyParam('menu', false);
        const navigation = apiHelper.getBodyParam('navigation', false);
        const notifications = apiHelper.getBodyParam('notifications', false);
        const search = apiHelper.getBodyParam('search', false);
        const theming = apiHelper.getBodyParam('theming', false);
        const alerts = apiHelper.getBodyParam('alerts', false);
        const autoExpandAlert = apiHelper.getBodyParam('autoExpandAlert', false);
        const experienceHandler = new Experience(false, noDomain, true);
        const appConfigHandler = new AppConfig(false, noDomain, true);
        const pagePropHandler = new PageProperty(false, noDomain, true);
        const themeHandler = new ThemeM2M(false, noDomain, true);

        const experienceUpdate = experienceHandler.updateRecord({
            sysId,
            title: general?.title,
            path: general?.path
        });
        const appConfigUpdate = appConfigHandler.updateRecord({
            sysId: adminPanelID,
            landing_path: general?.landingPath,
            description: general?.description
        });
        const themeUpdate = themeHandler.updateRecord({
            adminPanelID,
            ...theming
        });
		const propUpdates = pagePropHandler.updateProps(sysId,{
			header: {
				...menu,
				...notifications,
				searchPublic : search.searchPublic,
				searchPrivate: search.searchPrivate
			},
			footer,
			search: search.selectedSearchSource,
			toolbar: navigation,
            alerts: alerts.alertAutoDismissConfig,
            autoExpandAlert: autoExpandAlert.autoExpandAlertMessage
		});


        apiHelper.getResponseGlideOperation({
            experience: experienceUpdate,
            appConfig: appConfigUpdate,
			...propUpdates,
			theme:themeUpdate
        }, BuilderToolkitConstants.ERRORS.FAILED_TO_UPDATE);
    });

})(request, response);
