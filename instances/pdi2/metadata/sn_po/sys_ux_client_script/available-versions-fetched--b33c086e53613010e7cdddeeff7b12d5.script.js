/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    // Get the versions
    const comparableVersions = api.data.fetch_available_versions_1.output.data.GlidePromin_Query.comparableVersions;

    if(comparableVersions && comparableVersions.length > 0){
        const versionList = comparableVersions.map(v => ({
            id: v.id,
            label: v.name + (v.lastMined ? '(' + v.lastMined.split(' ')[0] + ')' : ''),
            lastMined: v.lastMined,
        }));
        api.setState('available_versions', versionList); 
    }        
}
