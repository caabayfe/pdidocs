var DomainConfigAjax = Class.create();

		DomainConfigAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
					setSupportMethod:function () {
						if(!GlideDomainSupport.isAuthorized())
							return;

						var method = this.getParameter('sysparm_support_method');
						var forceInstall = this.getParameter('sysparm_force_install');
						if (method == 'Path') {
							var pathProvider = new GlideDomainPathProvider();
							if ( forceInstall ) {
								pathProvider.install(true);
							}
							else {
								// Install if not already done
								if (!pathProvider.isInstalled()) {
									pathProvider.install(true);
								}

								// ...and switch to Paths.
								pathProvider.enable();
							}
						}
						if (method == 'Number') {
							var numberProvider = new GlideDomainNumberProvider();
							if ( forceInstall ) {
								numberProvider.install(true);
							}
							else {
								// Install if not already done
								if (!numberProvider.isInstalled()) {
									numberProvider.install(true);
								}

								// ...and switch to Numbers.
								numberProvider.enable();
							}
						}
						if (method == 'None') {
							var spoolProvider = new GlideDomainSpoolProvider();
							spoolProvider.enable();
						}

						// Get new validator readings after such a major change.
						this.startValidation();
					},

					changeDomainTable:function () {
						if(!GlideDomainSupport.isAuthorized())
							return;

						var table = this.getParameter('sysparm_table');
						var reset = this.getParameter('sysparm_reset');
						GlideDomainSupport.changeDomainTable(table, reset == "true");
					},

					resetTablesToGlobal:function () {
						if(!GlideDomainSupport.isAuthorized())
							return;

						GlideDomainSupport.resetTablesToGlobal();
					},

					startValidation:function () {
						var validator = new GlideDomainValidator.getValidator();
						validator.validateDomains();
					},

					getValidationProgress:function () {
						var validator = new GlideDomainValidator.getValidator();
						return validator.getProgress();
					},

					type:'DomainConfigAjax'
				}
		);
