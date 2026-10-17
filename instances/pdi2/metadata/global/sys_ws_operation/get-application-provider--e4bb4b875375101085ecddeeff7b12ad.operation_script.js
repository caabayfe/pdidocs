(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var params = request.queryParams;
    var ajaxMessaging = new global.AJAXMessagingUtils();
    var userDocument = JSON.parse(ajaxMessaging.getUserRecordDetails(params.interaction_id[0]));
    var res = ajaxMessaging.getApplicationProvidersWithExtnPoint(userDocument.table, userDocument.sys_id, params.channel_id[0]);
    response.setBody(constructProps(JSON.parse(res), userDocument));
})(request, response);

function constructProps(answer, userDocument) {
    var provider = answer.application_providers;
    var clients = answer.clients;
    var uniqueSysId = answer.unique_sys_id;
    var params = {
        fromNumbers: provider ? constructProvider(provider): provider,
        toNumbers: constructClients(clients),
        uniqueSysId: uniqueSysId,
        userDocument: userDocument
    };
    return params;
}

function constructProvider(provider) {
    for (var j = 0; j < provider.length; j++) {
        provider[j].id = provider[j].inbound_id;
        provider[j].dropdown = "fromField";
        provider[j].label = provider[j].name + ' (' + provider[j].inbound_id + ')';
    }
	return provider;
}

function constructClients(clients) {
	if (clients) {
        for (var k = 0; k < clients.length; k++) {
            clients[k].id = clients[k].number;
            clients[k].dropdown = "toField";
            clients[k].label += ' (' + clients[k].number + ')';
        }
    } else {
        clients = [];
    }
	clients.push({
        "field_name": "other",
        "number": "other",
        "id": "other",
        "dropdown": "toField",
        "label": "Other"
    });
	return clients;
}
