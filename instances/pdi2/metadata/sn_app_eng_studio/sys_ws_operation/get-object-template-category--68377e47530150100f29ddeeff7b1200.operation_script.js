// Returns an array of template manifest records
// format -> [{tableName, tableNameId, templateId}]
function getTemplateManifests() {
    var templateManifests = [];

    var templateManifestRecords = new GlideRecord("sys_app_template_manifest");
    templateManifestRecords.addJoinQuery("sys_app_template");
    templateManifestRecords.addQuery("template.active", true);
    templateManifestRecords.query();

    while (templateManifestRecords.next()) {
        templateManifests.push({
            tableName: templateManifestRecords.table_name
                .getRefRecord()
                .getValue("name"),
            tableNameId: templateManifestRecords.getValue('table_name'),
            templateId: templateManifestRecords.getValue('template')
        });
    }

    return templateManifests;
}

// Returns taxonomy lookup from sn_app_eng_studio_taxonomy table.
// format -> { taxonomyName: {taxonomyId, taxonomyName, taxonomyCategorySysId, taxonomyCategoryDisplayValue} }
function getTaxonomyLookup(templateManifests) {
    if (!templateManifests || !templateManifests.length) {
        // Return empty lookup if there are no manifests
        return {};
    }

    var taxonomyDefinitionsDataModel = new TaxonomyDefinitionsDataModel();
    var getImageUrl = taxonomyDefinitionsDataModel._getImageUrl;
    var getTableType = taxonomyDefinitionsDataModel._getTableType;
    var taxonomyLookup = {};
    var taxonomyRecords = new GlideRecord("sn_app_eng_studio_taxonomy");
    var taxonomyQuery = null;
    templateManifests.forEach(function(templateManifest, index) {
        if (index === 0) {
            taxonomyQuery = taxonomyRecords.addQuery('table', templateManifest.tableName);
        } else {
            taxonomyQuery = taxonomyQuery.addOrCondition('table', templateManifest.tableName);
        }
    });

    taxonomyRecords.query();

    while (taxonomyRecords.next()) {
        var tableName = taxonomyRecords.getValue('table');
        var tableNameOverride = taxonomyRecords.getDisplayValue("table_name_override") || "";

        taxonomyLookup[tableName] = {
            taxonomyId: taxonomyRecords.getValue('sys_id'),
            taxonomyName: tableName,
            taxonomyCategorySysId: taxonomyRecords.getValue('category'),
            taxonomyCategoryDisplayValue: taxonomyRecords.getDisplayValue('category'),
            taxonomyIcon: getImageUrl(taxonomyRecords, 'icon'),
            taxonomyType: getTableType(tableName, tableNameOverride)
        };
    }

    return taxonomyLookup;
}

// Returns a lookup which has templateId as the key and
// format -> {templateId: {categoryList: [{taxonomyId, taxonomyName, taxonomyCategorySysId, taxonomyCategoryDisplayValue}] }}
function combineData(templateManifests, taxonomyLookup) {
    var templateCategoryLookup = {};

    templateManifests.forEach(function(templateManifest) {
        var templateId = templateManifest.templateId;

        if (!templateCategoryLookup[templateId]) {
            // First occurrence of a template
            // Initialize the value in the lookup
            templateCategoryLookup[templateId] = {
                templateId: templateId,
                categoryLookup: {}
            };
        }

        var categoryObject = taxonomyLookup[templateManifest.tableName];

        // Only add category if the categoryObject was found in the creator studio taxonomy table
        if (categoryObject) {
            categoryObject.tableSysId = templateManifest.tableNameId;
            templateCategoryLookup[templateId].categoryLookup[templateManifest.tableNameId] = categoryObject;
        }
    });

    return templateCategoryLookup;
}

// Formats templateCategoryLookup for api response
function formatApiResponse(templateCategoryLookup) {
    var response = [];

    // Convert templateCategoryLookup lookup to an array 
    Object.keys(templateCategoryLookup).forEach(function(key) {
        var categories = [];
        Object.keys(templateCategoryLookup[key].categoryLookup)
            .forEach(function(categoryKey) {
                categories.push(templateCategoryLookup[key].categoryLookup[categoryKey]);
            });

        response.push({
            templateId: templateCategoryLookup[key].templateId,
            categories: categories
        });
    });

    return response;
}

function process(request, response) {
    var templateManifests = getTemplateManifests();
    var taxonomyLookup = getTaxonomyLookup(templateManifests);
    var templateCategoryLookup = combineData(templateManifests, taxonomyLookup);

    response.setStatus(200);
    response.setBody(formatApiResponse(templateCategoryLookup));
}

process(request, response);
