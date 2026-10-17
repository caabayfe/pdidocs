/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        sysId,
        table
    } = api.context.props;

    let manageTagsToSave = [...api.state.manageTags];
    // Remove the tags that weren't added, edited, or deleted
    for (let i = manageTagsToSave.length - 1; i >= 0; i--) {
        let tag = manageTagsToSave[i];
        if (!tag.added && !tag.modified && !tag.deleted) {
            manageTagsToSave.splice(i, 1);
        }
    }
    api.data.explore_ci_manage_tags_db.execute({
        "payload": manageTagsToSave,
        "sysId": sysId,
        "table": table
    });
}
