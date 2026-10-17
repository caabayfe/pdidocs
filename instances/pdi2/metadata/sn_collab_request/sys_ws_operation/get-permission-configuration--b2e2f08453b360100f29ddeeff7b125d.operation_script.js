function formatApiResponse(data) {
    var response = [];
    Object.keys(data)
        .forEach(function(permissionSectionId) {
            response.push(data[permissionSectionId]);
        });

    return response;
}

function combineData(permissionSectionLookup, permissionSetSectionMappings) {
    permissionSetSectionMappings
        .forEach(function(permissionSetSectionMapping) {
            permissionSectionLookup[permissionSetSectionMapping.permissionSectionId].permissionSets
                .push({
                    id: permissionSetSectionMapping.permissionSetId,
                    isAllPermissionSet: permissionSetSectionMapping.isAllPermissionSet,
                    needsLabelLookup: permissionSetSectionMapping.needsLabelLookup,
                });
        });

    return permissionSectionLookup;
}

function getPermissionSetSectionMappings() {
    var permissionSetSectionMappings = [];

    var permissionSetSectionMappingRecords = new GlideRecord('sn_collab_request_permission_set_section_mapping');
    permissionSetSectionMappingRecords.addActiveQuery();
    permissionSetSectionMappingRecords.orderBy('order');
    permissionSetSectionMappingRecords.query();

    while (permissionSetSectionMappingRecords.next()) {
        var permissionSetSectionMapping = {
            id: permissionSetSectionMappingRecords.getValue('sys_id'),
            permissionSectionId: permissionSetSectionMappingRecords.getValue('permission_section'),
            permissionSetId: permissionSetSectionMappingRecords.getValue('permission_set'),
            isAllPermissionSet: permissionSetSectionMappingRecords.getDisplayValue('is_all_permission_set') === "true",
            needsLabelLookup: permissionSetSectionMappingRecords.getDisplayValue('needs_label_lookup') === "true",
        };

        permissionSetSectionMappings.push(permissionSetSectionMapping);
    }

    return permissionSetSectionMappings;
}

function getPermissionSections() {
    var permissionSectionLookup = {};

    var permissionSectionRecords = new GlideRecord('sn_collab_request_permission_section');
    permissionSectionRecords.addActiveQuery();
    permissionSectionRecords.orderBy('order');
    permissionSectionRecords.query();

    while (permissionSectionRecords.next()) {
        var permissionSectionId = permissionSectionRecords.getValue('sys_id');
        permissionSectionLookup[permissionSectionId] = {
            id: permissionSectionRecords.getValue('sys_id'),
            title: {
                value: permissionSectionRecords.getValue('title'),
                display_value: permissionSectionRecords.getDisplayValue('title'),
            },
            info: {
                value: permissionSectionRecords.getValue('info'),
                display_value: permissionSectionRecords.getDisplayValue('info'),
            },
            permissionSets: []
        };
    }

    return permissionSectionLookup;
}

function process(request, response) {
    try {
        var permissionSectionLookup = getPermissionSections();
        var permissionSetSectionMappings = getPermissionSetSectionMappings();

        var data = combineData(permissionSectionLookup, permissionSetSectionMappings);

        response.setBody(formatApiResponse(data));

        response.setStatus(200);
    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
    }
}

process(request, response);
