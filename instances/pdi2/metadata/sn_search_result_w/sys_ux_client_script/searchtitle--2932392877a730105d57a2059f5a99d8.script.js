/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const pageProps = api.context.props;
    if (pageProps.searchTerm)
      helpers.screen.updateStatus({title: `Search Results - ${pageProps.searchTerm}`});
}
