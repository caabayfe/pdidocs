var ResponseTemplate = Class.create();
ResponseTemplate.prototype = {
    initialize: function() {
		this.CHANNEL_FORM = 'Form';
		this.CHANNEL_CHAT = 'Chat';
		this.CHANNEL_EMAIL = 'Email';
	},
	
	/**
	 * @param tableName
	 * @param recordId
	 * @param searchTerm
	 * @param limit
	 * @param offset
	 * @param includeEvaluatedBody
	 * @param errorFormat [ex:"<span style='color:#ff0000'>${%s}</span>"]
	 * @param opts [optional parameters that can be passed to extension point's should run]
	 * @param userFieldForLanguage [user field for which we want to query the language]
	 * @return all the templates that can be applied to a given record
	 * [
	 *  {
	 *    "sys_id": string,
	 *    "name": string,
   *    "short_name": string,
   *    "body": html body,
   *    "short_name_match": true if exact match on short_name,
   *    "evaluated_response": {
	 *	 						"success": boolean,
	 *	 						"evaluated_body": evaluated html body,
	 *	 						"error": {
	 *      								"inAccessibleVariables": string,
	 *	 	 								"unEvaluatedVariables": string,
	 *	 	 								"message": error message
	 *	 						}
	 * 	  					}
	 *  }
	 * ]
	 */
	query: function(tableName, recordId, searchTerm, limit, offset, includeEvaluatedBody, errorFormat, opts, userFieldForLanguage) {
        var eps = new GlideScriptedExtensionPoint().getExtensions("sn_templated_snip.response_template");
        for (var i = 0; i < eps.length; i++) {
            try {
                var ext = eps[i];
                if (ext.shouldRun(opts))
                    return ext.query(tableName, recordId, searchTerm, limit, offset, includeEvaluatedBody, errorFormat, opts);
            } catch (e) {
                gs.error("Unable to run query method.");
            }
        }

		var responseTemplate = new sn_templated_snippets.ResponseTemplate();
		if (gs.nil(opts.channel)) {
			// prepare to retrieve all templates with at least one channel
			responseTemplate.setChannel(null);
		} else {
			// prepare to retieve templates associated with a particular channel
			responseTemplate.setChannel(opts.channel);
		}

        userFieldForLanguage = userFieldForLanguage ? userFieldForLanguage : "";
        return responseTemplate.query(tableName, recordId, searchTerm, limit, offset, includeEvaluatedBody, errorFormat, userFieldForLanguage);
    },

	/**
	 * @param templateId
	 * @param tableName
	 * @param recordId
	 * @param errorFormat [default:"<span style='color:#ff0000'>${%s}</span>"]
     * @param opts [optional parameters that can be passed to extension point's should run]
	 * @return template body for the given record
	 * {
	 *	 "success": boolean,
	 *	 "evaluated_body": html body,
	 *	 "error": {
	 *       "inAccessibleVariables": string,
	 *	 	 "unEvaluatedVariables": string,
	 *	 	 "message": error message
	 *	 }
	 * }
	 */
    render: function(templateId, tableName, recordId, errorFormat, opts) {
        var eps = new GlideScriptedExtensionPoint().getExtensions("sn_templated_snip.response_template");
        for (var i = 0; i < eps.length; i++) {
            try {
                var ext = eps[i];
                if (ext.shouldRun(opts))
                    return ext.render(templateId, tableName, recordId, errorFormat, opts);
            } catch (e) {
                gs.error("Unable to run render method.");
            }
        }

		var responseTemplate = new sn_templated_snippets.ResponseTemplate();
        return responseTemplate.render(templateId, tableName, recordId, errorFormat);
    },

    /**
     * Get the language choices for template language dropdown from the `preferred_language` column of `sys_user` table
	 * We are removing NULL_OVERRIDE to support the default language as none for existing response templates or if the user doesn't want to choose a language for the template
     * @return {GlideChoiceList} List of language choices
     */
    getLanguageChoiceList:function(){
        var choices = GlideChoiceList.getChoiceList('sys_user','preferred_language');
        choices.removeChoice('NULL_OVERRIDE');
        return choices;
    },

    type: 'ResponseTemplate'
};
