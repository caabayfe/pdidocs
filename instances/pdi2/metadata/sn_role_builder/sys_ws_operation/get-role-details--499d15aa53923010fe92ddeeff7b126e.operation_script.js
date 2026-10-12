function formatApiResponse(data) {
    var response = {
        sys_id: data.sys_id,
        name: data.name,
        description: data.description,
        scope: data.scope,
        scope_name: data.scope_name,
        icon: "/" + data.icon + ".iix",
        files: [],
        contained_roles: data.contained_roles
    };

    // Loop over all categories
    Object.keys(data.categories)
        .forEach(function(categorySysId) {
            // Loop over all files in a category
            Object.keys(data['categories'][categorySysId].files)
                .forEach(function(fileSysId) {
                    // Push the file in response
                    response.files.push(data['categories'][categorySysId]['files'][fileSysId]);
                });
        });

    return response;
}

function getDotWalkPath(path) {
    var slashRegex = /^\/+|\/+$/g;
    return (path || "").replace(slashRegex, "").replaceAll("/", ".");
}

function combineData(
    role,
    applicationInventory,
    fileACLLookup,
    categoryLookup,
    filterCategories
) {
    // Setup base role info
    var files = applicationInventory.files;

    var data = {
        sys_id: role.sys_id,
        name: {
            value: role.name_value,
            display_value: role.name,
        },
        icon: role.icon,
        description: role.description,
        scope: role.scope,
        scope_name: applicationInventory.scope_name,
        categories: {},
        contained_roles: role.contained_roles
    };

    for (var i = 0; i < filterCategories.length; i++) {
        var categorySysId = filterCategories[i];
        data['categories'][categorySysId] = {
            sys_id: categorySysId,
            name: categoryLookup[categorySysId].name,
            description: categoryLookup[categorySysId].description,
            files: {}
        };
    }

    for (var idx = 0; idx < files.length; idx++) {
        var file = files[idx];
        var fileSysId = file.sys_id;
        var fileNameValue = file.name_value;
        var fileCategory = file.taxonomy_category;
        var experienceFileName = getDotWalkPath(file.launch_url);

        if (!data['categories'][fileCategory]) {
            // File is not of category type data or experience
            continue;
        }

        data['categories'][fileCategory]['files'][fileSysId] = {
            sys_id: file.sys_id,
            name: {
                value: file.name_value,
                display_value: file.name
            },
            taxonomy_category: file.taxonomy_category,
            taxonomy_definition: file.taxonomy_definition,
            launch_url: file.launch_url,
            acl_file_name: file.name_value || experienceFileName,
            acls: fileACLLookup[fileNameValue] || fileACLLookup[experienceFileName] || {}
        };
    }

    return data;
}

function getCategoryLookup() {
    var categoryRecords = new GlideRecord('sn_app_eng_studio_taxonomy_category');
    var categoryLookup = {};

    categoryRecords.query();

    while (categoryRecords.next()) {
        var sys_id = categoryRecords.getValue('sys_id');
        categoryLookup[sys_id] = {
            sys_id: sys_id,
            name: categoryRecords.getValue('sys_name'),
            description: categoryRecords.getValue('description')
        };
    }

    return categoryLookup;
}


function getACLRecords(roleAssociationLookup) {
    var aclRecords = new GlideRecord('sys_security_acl');
    var aclQuery = null;
    var fileACLLookup = {};

    if (!Object.keys(roleAssociationLookup).length) {
        // Since there are no acl's, there is nothing to lookup
        return fileACLLookup;
    }

    aclRecords.addActiveQuery();
    aclRecords.addQuery('sys_id', 'IN', Object.keys(roleAssociationLookup));
    aclRecords.query();

    while (aclRecords.next()) {
        var sys_id = aclRecords.getValue('sys_id');
        var fileName = aclRecords.getValue('name');
        var operation = aclRecords.getValue('operation');

        // The type can be name or sys_id of the sys_security_type
        var type = aclRecords.getValue('type');
        var aclKey = operation + '#' + type;

        if (fileName.endsWith('.*')) {
            // This is a ux_page_route entry, so combine it with ux_page entry by removing .*
            fileName = fileName.slice(0, -2);
        }

        fileACLLookup[fileName] = fileACLLookup[fileName] || {};
        fileACLLookup[fileName][aclKey] = {
            sys_id: sys_id,
            security_acl_role_sys_id: roleAssociationLookup[sys_id],
            operation: operation
        };
    }

    return fileACLLookup;
}

function getRoleAssociations(roleSysId) {
    var roleAssociationRecords = new GlideRecord('sys_security_acl_role');
    var roleAssociationLookup = {};

    roleAssociationRecords.addQuery('sys_user_role', roleSysId);
    roleAssociationRecords.query();

    while (roleAssociationRecords.next()) {
        var associationSysId = roleAssociationRecords.getValue('sys_id');
        var aclSysId = roleAssociationRecords.getValue('sys_security_acl');
        roleAssociationLookup[aclSysId] = associationSysId;
    }

    return roleAssociationLookup;
}

function getRoleDetails(roleSysId) {
    var roleRecords = new GlideRecord('sys_user_role');
    var taxonomyRecords = new GlideRecord('sn_app_eng_studio_taxonomy');
    var roleContainsRecords = new GlideRecord('sys_user_role_contains');

    roleRecords.addQuery('sys_id', roleSysId);
    taxonomyRecords.addQuery('table', 'sys_user_role');
    roleContainsRecords.addQuery('role', roleSysId);

    roleRecords.query();
    taxonomyRecords.query();
    roleContainsRecords.query();

    if (!roleRecords.next()) {
        throw sn_app_eng_studio.CreatorStudioConstants.errors.APPLICATION_FILE_DOES_NOT_EXIST;
    }

    if (!taxonomyRecords.next()) {
        throw sn_app_eng_studio.CreatorStudioConstants.errors.TAXONOMY_DEFINITION_DOES_NOT_EXIST;
    }

    var containedRoles = [];
    while (roleContainsRecords.next()) {
        containedRoles.push({
            sys_id: roleContainsRecords.getValue('sys_id'),
            name: roleContainsRecords.getDisplayValue('contains')
        });
    }

    return {
        sys_id: roleRecords.getValue('sys_id'),
        name: roleRecords.getValue('name'),
        name_value: roleRecords.getDisplayValue('name'),
        icon: taxonomyRecords.getValue('icon'),
        description: {
            value: roleRecords.getValue('description'),
            display_value: roleRecords.getDisplayValue('description'),
        },
        scope: {
            value: roleRecords.getValue('sys_scope'),
            display_value: roleRecords.getDisplayValue('sys_scope'),
        },
        contained_roles: containedRoles
    };
}

function process(request, response) {
    try {
        var DATA_CATEGORY_SYS_ID = 'dd66a7577703330001fb4311a810611e';
        var EXPERIENCE_CATEGORY_SYS_ID = 'db5663577703330001fb4311a81061b9';
        var applicationSysId = request.pathParams.application_sys_id;
        var roleSysId = request.pathParams.role_sys_id;

        // Get the application inventory for the app-id sent in request
        var applicationInventory = sn_app_eng_studio.ApplicationInventoryListBuilder.build(applicationSysId);

        // Get the sys_user_role for the role send in request
        var role = getRoleDetails(roleSysId);

        // Get associations with the role
        var roleAssociationLookup = getRoleAssociations(roleSysId);

        // Get the acl records from the associated sys_id's
        var fileACLLookup = getACLRecords(roleAssociationLookup);

        // Get category lookup to filter out data and experience files
        var categoryLookup = getCategoryLookup();

        // Combine all the data
        var combinedData = combineData(
            role,
            applicationInventory,
            fileACLLookup,
            categoryLookup,
            [DATA_CATEGORY_SYS_ID, EXPERIENCE_CATEGORY_SYS_ID]
        );

        response.setBody(formatApiResponse(combinedData));
        response.setStatus(200);

    } catch (exception) {
        switch (exception) {
            case sn_app_eng_studio.CreatorStudioConstants.errors.APPLICATION_DOES_NOT_EXIST:
                throw new sn_ws_err.ServiceError()
                    .setStatus(404)
                    .setMessage(gs.getMessageLang('Application, with sys_id {0}, does not exist', "en", [applicationSysId]))
                    .setDetail(gs.getMessage('Application, with sys_id {0}, does not exist', [applicationSysId]));

            case sn_app_eng_studio.CreatorStudioConstants.errors.APPLICATION_ACCESS_DENIED:
                throw new sn_ws_err.ServiceError()
                    .setStatus(403)
                    .setMessage(gs.getMessageLang('Access to application, with sys_id {0}, is denied', "en", [applicationSysId]))
                    .setDetail(gs.getMessage('Access to application, with sys_id {0}, is denied', [applicationSysId]));

            case sn_app_eng_studio.CreatorStudioConstants.errors.APPLICATION_FILE_DOES_NOT_EXIST:
                throw new sn_ws_err.ServiceError()
                    .setStatus(404)
                    .setMessage(gs.getMessageLang('Application role object with sys_id {0} does not exist', "en", [roleSysId]))
                    .setDetail(gs.getMessage('Application role object with sys_id {0} does not exist', [roleSysId]));

            case sn_app_eng_studio.CreatorStudioConstants.errors.TAXONOMY_DEFINITION_DOES_NOT_EXIST:
                throw new sn_ws_err.ServiceError()
                    .setStatus(404)
                    .setMessage(gs.getMessageLang('Taxonomy definition for sys_user_role {0} does not exist', "en", [roleSysId]))
                    .setDetail(gs.getMessage('Taxonomy definition for sys_user_role {0} does not exist', [roleSysId]));

            default:
                throw new sn_ws_err.ServiceError()
                    .setStatus(500)
                    .setMessage(gs.getMessageLang('Unhandled exception {0}', "en", [exception]))
                    .setDetail(gs.getMessage('Unhandled exception {0}', [exception]));

        }
    }
}

process(request, response);
