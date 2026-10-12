/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('ATTACH_ARTICLE_TO_COMMENTS', {
        isPreviewExperience: api.context.props.isPreviewExperience,
        additionalNotes: api.state.additionalNotes,
        isWorkNoteExperience: api.context.props.isWorkNoteExperience
    });
}
