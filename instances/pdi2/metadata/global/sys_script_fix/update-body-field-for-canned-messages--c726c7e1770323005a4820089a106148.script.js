(function() {
		//query for sys_dictionary entry to check for table name 'sys_email_canned_message' with 'internal_type' as 'html'
		var stringDictionaryEntries = new GlideRecord('sys_dictionary');
		stringDictionaryEntries.addActiveQuery();
		stringDictionaryEntries.addQuery('name', 'sys_email_canned_message');
		stringDictionaryEntries.addQuery('element', 'body');
		stringDictionaryEntries.query();
	
		if(stringDictionaryEntries.next()) {
			var internalType = stringDictionaryEntries.getValue('internal_type');
	    		if(internalType == 'html_script')
				gs.info('Update Body field for Canned Messages: skipping fix column already html_script');
			else if(internalType == 'html') {
				gs.info('Update Body field for Canned Messages: updating type from html to html_script');
				stringDictionaryEntries.setValue('internal_type','html_script');
			}
			else if(internalType == 'string'){ 
				if (gs.getProperty("glide.ui.email_client.html") == "false") {
					gs.info('Update Body field for Canned Messages: skipping email client is in Text mode');
					return;
				}
				updateCannedMessagesFromStringToHtmlScript();
				gs.info('Update Body field for Canned Messages: updating type from string to html_script');
				stringDictionaryEntries.setValue('internal_type','html_script');
			}
			
			gs.info('Update Body field for Canned Messages: updating dependent field of body');
			stringDictionaryEntries.setValue('use_dependent_field',true);
			stringDictionaryEntries.setValue('dependent','table');
			stringDictionaryEntries.setValue('dependent_on_field','table');
			stringDictionaryEntries.update();
		}
	
    		function updateCannedMessagesFromStringToHtmlScript() {
			var cannedMessage = new GlideRecord('sys_email_canned_message');
			cannedMessage.query();
			while (cannedMessage.next()) {
				//format the body by using the scriptable API and set the format body back to the cannedMessage
				if (!gs.nil(cannedMessage.body)) {
					var formattedText = SNC.EmailClientFormatter.formatEmailText(cannedMessage.body + '');
					cannedMessage.setValue('body', formattedText);
					cannedMessage.update();
				}
			}
		}
	})();
