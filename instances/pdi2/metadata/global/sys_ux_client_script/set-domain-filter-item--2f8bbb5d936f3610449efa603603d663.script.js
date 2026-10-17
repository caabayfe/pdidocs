/**
 * Transforms domain data into filter items for the domain filter dropdown
 * Adds "All" and "Global" options and sorts alphabetically
 *
 * @param {params} params
 * @param {api} params.api - The API for interacting with the component state
 * @param {any} params.event - The event that triggered this handler
 * @param {any} params.imports - Available imports
 * @param {ApiHelpers} params.helpers - Helper functions
 */
function handler({ api }) {
    const results = api.data.domains?.results || [];

    const filterItems = results.map(row => {
        return {
            id: row.sys_domain_path?.value || '',
            label: row.sys_domain?.displayValue || row.name?.displayValue || ''
        };
    });

    filterItems.sort((a, b) => a.label.localeCompare(b.label));

    filterItems.unshift(
        {
            id: 'all',
            label: 'All'
        },
        {
            id: '/',
            label: 'Global'
        }
    );

    api.setState("domain_filter_items", filterItems);
}
