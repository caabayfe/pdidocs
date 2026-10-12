/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     let result = api.data.deduplication_template_get_library_details.output.libraryDetails;
     api.setState('selectedLibraryName', result.name);
     api.setState('selectedLibraryDescription', result.description);
     api.setState('templateCount', result.templateCount);
     api.setState('templateRunningCount', result.templateRunningCount);
     api.setState('libraryNameSet', result.name);
     api.setState('libraryDescriptionSet',result.description);
}
