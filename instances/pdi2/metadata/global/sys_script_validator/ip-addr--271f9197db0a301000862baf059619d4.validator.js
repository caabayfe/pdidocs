function validate(value, fieldName) {
			if(!NOW.sp)
				return true;
			
			var validator = function(callback) {
				if (value === null || value === '') { 
					callback(fieldName, true); 
					return ;
				}
				var ajax = new GlideAjax('IPAddressValidator');
				ajax.addParam('sysparm_name', 'validateMobileAndServicePortal');
				ajax.addParam('table', g_form.getTableName());
				ajax.addParam('field', fieldName);
				ajax.addParam('value', value);
				ajax.getXMLAnswer(function(answer) {
					if (answer == "false") {
						getMessage("is an invalid IP address", function(trnsErrMsg) { 
							callback(fieldName, false, value + " " + trnsErrMsg); 
						});
					}
					else { 
						callback(fieldName, true); 
					}
				});		
			};
			var executor = g_ui_scripts['sp.validation.executor']();
			return executor.execute(fieldName, validator, g_validation_script_field_count, g_form, NOW);
		}
