/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let libraryTree = Object.values(api.data.deduplication_template_get_library_tree.output.libraryTree).map(o => Object.assign({
        icon: 'book-fill',
        actionable: true,
        type: 'library'
    }, o));
    libraryTree.sort((a, b) => (a.label > b.label) ? 1 : -1);
    var expandItems = libraryTree.filter(l => l.expanded).map(i => [i.id]);
    api.setState('expandItems', expandItems);
    //Display first library information on page load
    if (libraryTree.length > 0) {
        api.setState('librarySysId', libraryTree[0].id);
    }

        api.setState('emptyState', libraryTree.length == 0 && !api.state.librarySearchTerm);
        api.setState('emptyStateSearchResults', libraryTree.length == 0 && api.state.librarySearchTerm);

    api.setState('libraryTree', libraryTree);
}
