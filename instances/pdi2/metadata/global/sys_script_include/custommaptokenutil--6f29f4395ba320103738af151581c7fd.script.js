var CustomMapTokenUtil = Class.create();
CustomMapTokenUtil.prototype = {
    initialize: function() {
    },

    type: 'CustomMapTokenUtil',
	getTokenHandler: function(process, request, response) {
		function isValidParam(param) {
			return !gs.nil(param) && !gs.nil(param[0]);
		}

		function getCustomMapScreen(documentId) {
			var screenGR = new GlideRecord("sys_sg_screen");
			if (!screenGR.isValid())
				return null;
			screenGR.get(documentId);
			return screenGR;
		}

		function getCustomMapProvider(providerId) {
			var customMapProviderGR = new GlideRecord("sys_sg_custom_map_provider");
			if (!customMapProviderGR.isValid())
				return null;
			customMapProviderGR.get(providerId);
			return customMapProviderGR;
		}

		function getMappedInCredentials(customMapProviderGR) {
			var creds = {};

			if (gs.nil(customMapProviderGR))
				return creds;

			creds['clientId'] = customMapProviderGR.getValue("map_provider_app_id");
			var clientSecret = customMapProviderGR.getElement("map_provider_app_secret");
			creds['clientSecret'] = gs.nil(clientSecret) ? null : clientSecret.getDecryptedValue();
			return creds;
		}

		function isScreenAssociatedWithProvider(screenGR, providerId) {
			if(screenGR.getValue("sys_class_name") === "sys_sg_parameter_screen") {
				var customMapConfigAttribute = new GlideRecord("sys_sg_input_attribute");
				customMapConfigAttribute.addQuery("name", "CustomMapConfigId");
				customMapConfigAttribute.query();
			
				var sections = [];
				
				while(customMapConfigAttribute.next()) {
					if (customMapConfigAttribute.input.parameter_screen.getValue() === screenGR.getUniqueValue())
						return true;
					else
						sections.push(customMapConfigAttribute.input.parameter_section.getValue());
				}
				
				if(sections.length === 0)
					return false;
				
				var parameterSection = new GlideRecord("sys_sg_parameter_section_m2m");
				parameterSection.addQuery("parameter_screen", screenGR.getUniqueValue());
				parameterSection.addQuery("parameter_section", "IN", sections.join(","));
				parameterSection.setLimit(1);
				parameterSection.query();
				
				return parameterSection.next();					   
			} else if(screenGR.getValue("sys_class_name") === "sys_sg_custom_map_screen") {
				var customMapScreenGR = new GlideRecordUtil().getGR(screenGR.sys_class_name, screenGR.sys_id);
				var defaultProviderId = customMapScreenGR.getValue("default_provider");
				var providerList = customMapScreenGR.getValue("providers");
				return providerId.equals(defaultProviderId) ||
					(!gs.nil(providerList) && providerList.toString().includes(providerId));
			}
			return false;
		}

		function callMappedInService(externalId, creds, response) {
			var mappedInUrl = "https://api-gateway.mappedin.com/exports/legacy/1/bundle?venue=" + externalId + "&version=1.0.0";
			var httpRequest = new sn_ws.RESTMessageV2();
			httpRequest.setEndpoint(mappedInUrl);
			httpRequest.setHttpMethod('GET');
			httpRequest.setBasicAuth(creds['clientId'], creds['clientSecret']);
			var httpResponse = httpRequest.execute();
			response.setStatus(httpResponse.getStatusCode());
			if (httpResponse.getStatusCode().toString() !== '200')
				response.setError(new sn_ws_err.BadRequestError('Api call to Mappedin failed. Error : ' + httpResponse.getErrorMessage()));
			else
				response.setBody(JSON.parse(httpResponse.getBody()));
		}

		var queryParams = request.queryParams;
		if (gs.nil(queryParams) || !isValidParam(queryParams.externalId) || !isValidParam(queryParams.documentId) || !isValidParam(queryParams.providerId)) {
			response.setStatus(400);
			response.setError(new sn_ws_err.BadRequestError('Missing required parameter(s) externalId, documentId or providerId'));
			return;
		}

		var documentId = queryParams.documentId[0];
		var providerId = queryParams.providerId[0];
		var externalId = queryParams.externalId[0];

		var customMapScreenGR = getCustomMapScreen(documentId);
		if (!customMapScreenGR.isValidRecord()) {
			response.setStatus(400);
			response.setError(new sn_ws_err.BadRequestError("Can't find custom map screen with documentId :" + documentId));
			return;
		}

		if (!isScreenAssociatedWithProvider(customMapScreenGR, providerId)) {
			response.setStatus(400);
			response.setError(new sn_ws_err.BadRequestError("Invalid documentId :" + documentId + " providerId : " + providerId + " combination"));
			return;
		}

		var customMapProviderGR = getCustomMapProvider(providerId);
		if (!customMapProviderGR.isValidRecord()) {
			response.setStatus(400);
			response.setError(new sn_ws_err.BadRequestError("Can't find custom map screen provider with providerId: " + providerId));
			return;
		}

		var creds = getMappedInCredentials(customMapProviderGR);
		if (gs.nil(creds.clientId) || gs.nil(creds.clientSecret)) {		
			response.setStatus(400);
			response.setError(new sn_ws_err.BadRequestError('Mappedin credentials are not set'));
			return;
		}

		callMappedInService(externalId, creds, response);
	},
};
