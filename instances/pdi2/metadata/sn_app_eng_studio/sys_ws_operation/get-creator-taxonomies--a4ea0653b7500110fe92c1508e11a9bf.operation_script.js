(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var applicationSysId = request.pathParams.application_sys_id;
        AccessValidator.verifyApplicationAccess(applicationSysId);

        var creatorTaxonomies = [];
        var taxonomy = new GlideRecord("sn_app_eng_studio_taxonomy");
        taxonomy.addNotNullQuery('creator_url');
        taxonomy.query();

        while (taxonomy.next()) {
            var tableName = taxonomy.table;
            var now_GR = new GlideRecord(tableName);

            if (now_GR.canCreate()) {
				var taxonomyData = new TaxonomyDefinitionsDataModel().generateSingleTaxonomy(taxonomy.getValue('sys_id'));
				var taxonomyDetails = new GlideRecord('sn_app_eng_studio_taxonomy_details');
				taxonomyDetails.get('taxonomy_id', taxonomy.getValue('sys_id'));
				taxonomyData['creator_description'] = taxonomyDetails.getDisplayValue('creator_description') || '';
				
				// handle image
				var imageAttachmentValidator = new ImageAttachmentValidator();
				var imageValue = taxonomyDetails.getValue('hero_image');
				if(!gs.nil(imageValue)) {
					if(imageAttachmentValidator.attachmentExists(taxonomyDetails.getUniqueValue(), 'hero_image')) {
						taxonomyData['hero_image'] = '/' + imageValue + '.iix';
					}
				}
                creatorTaxonomies.push(taxonomyData);
            }
        }
		
		var result = {
			sys_id: applicationSysId,
			creator_taxonomies: creatorTaxonomies,
		};
		
        response.setStatus(200);
        response.setBody(result);
    } catch (exception) {
        switch (exception) {
            case CreatorStudioConstants.errors.APPLICATION_DOES_NOT_EXIST:
                throw new sn_ws_err.ServiceError()
                    .setStatus(404)
                    .setMessage(gs.getMessageLang("Application, with sys_id {0}, does not exist", "en", [applicationSysId]))
                    .setDetail(gs.getMessage("Application, with sys_id {0}, does not exist", [applicationSysId]));
            case CreatorStudioConstants.errors.APPLICATION_ACCESS_DENIED:
                throw new sn_ws_err.ServiceError()
                    .setStatus(403)
                    .setMessage(gs.getMessageLang("Access to application, with sys_id {0}, is denied", "en", [applicationSysId]))
                    .setDetail(gs.getMessage("Access to application, with sys_id {0}, is denied", [applicationSysId]));
            default:
                throw new sn_ws_err.ServiceError()
                    .setStatus(500)
                    .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
                    .setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
        }
    }
})(request, response);
