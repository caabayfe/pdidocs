/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { selectedTab, selectedTabIndex, selectedTabLabel } = event.payload;

    console.log(`Tab selected: "${selectedTabLabel}" (Index: ${selectedTabIndex})`);

    const tabId = selectedTab.split('=')[1].trim();
    console.log(`Tab ID: ${tabId}`);

    const tabMapping = {
        activity: {
            viewportElementId: 'viewport_1',
            route: 'list-grid',
            params: { t: String(Date.now()) }
        },
        instance_overview: {
            viewportElementId: 'viewport_2',
            route: 'list-grid',
            params: { activity: 'overview', t: String(Date.now()) }
        },
        configuration: {
            viewportElementId: 'viewport_3',
            route: 'configuration',
            params: { t: String(Date.now()) }
        },
        help: {
            viewportElementId: 'viewport_4',
            route: 'help',
            params: { t: String(Date.now()) }
        }
    };

    const mapping = tabMapping[tabId];

    if (!mapping) {
        console.error(`No mapping found for tab: ${tabId}`);
        return;
    }

    console.log(`Loading viewport: ${mapping.viewportElementId}, route: ${mapping.route}`);
    
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
            viewportElementId: mapping.viewportElementId,
            route: mapping.route,
            fields: {},
            params: mapping.params
        });
    }
