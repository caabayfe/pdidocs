function getTemplateManifests(templateId) {
    var templateManifests = [];

    var templateManifestRecords = new GlideRecord("sys_app_template_manifest");
    templateManifestRecords.addJoinQuery("sys_app_template");
    templateManifestRecords.addQuery("template.active", true);
    templateManifestRecords.addQuery("template", templateId);
    templateManifestRecords.query();

    while (templateManifestRecords.next()) {
        templateManifests.push({
            description: {
                value: templateManifestRecords.getValue('description'),
                display_value: templateManifestRecords.getDisplayValue('description'),
            },
            order: {
                value: templateManifestRecords.getValue('order'),
                display_value: templateManifestRecords.getDisplayValue('order'),
            },
            table_name: {
                value: templateManifestRecords.getValue('table_name'),
                display_value: templateManifestRecords.getDisplayValue('table_name'),
            },
        });
    }

    return templateManifests;
}

function process(request, response) {
    try {
        var templateId = request.queryParams.template;
        var templateManifests = getTemplateManifests(templateId);

        response.setStatus(200);
        response.setBody(templateManifests);
    } catch (exception) {
		throw new sn_ws_err.ServiceError()
			.setStatus(500)
			.setMessage(gs.getMessageLang('Unhandled exception {0}', "en", [exception]))
			.setDetail(gs.getMessage('Unhandled exception {0}', [exception]));
    }
}

process(request, response);
