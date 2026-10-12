var PayloadScannerAJAX = Class.create();
 
PayloadScannerAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
 
	/**
	 * Run the PayloadScannerAJAX for the current sys_app record
	 */
   scanCurrentApplication: function (sourceId, sourceName, reuseTemplateApp) {	
		try {

			var isMaint = gs.hasRole('maint');
			var isAppTemplateAuthor = gs.hasRole('app_template_author');
			var allowRoleBasedAccess = 
				gs.getProperty('com.snc.app_templates.enable_role_based_authoring', 'false') === 'true';

			//If I'm not maint nor app_template_author (and we allow role based access), fail
			if (!(isMaint || (allowRoleBasedAccess && isAppTemplateAuthor))) {
				gs.addErrorMessage(gs.getMessage('App template creation not allowed'));
				return;
			}
			
			sourceId = this.getParameter('sysparm_source_id') || sourceId;
			sourceName = this.getParameter('sysparm_source_name') || sourceName;
			reuseTemplateApp = this.getParameter('sysparm_reuse_template_app') || reuseTemplateApp;
						
			var preCheckScanner = new sn_templates.PreScanChecker();
			var preCheckResult = preCheckScanner.scan(sourceId, sourceName);
			
			if (gs.nil(preCheckResult) || preCheckResult.isTemplatizable() === false) {
				var errorMessage = gs.getMessage('Template cannot be created, reasons: {0}', preCheckResult.getReasons());
				gs.addErrorMessage(errorMessage);
				return;
			}
			
			var scanner = new sn_templates.PayloadScanner();
			var result = scanner.scan(sourceId, sourceName, reuseTemplateApp);

			if (gs.nil(result) || result.getStatus() !== 'SUCCESS') {
				// If we can't kick off the progress worker, tell the user
				gs.addErrorMessage(gs.getMessage('Error starting template creation: {0}', [result.getErrorMessage()]));
				return;
			}
						
			progressWorkerId = result.getProgressWorkerId();
			return progressWorkerId;

		} catch (e) {
			gs.addErrorMessage(e.message);
		}
	},
 
   type: 'PayloadScannerAJAX'
});
