function handler({
    api,
    event,
    helpers,
    imports
}) {

    const viewPortMap = {
        preservers: 'viewport_2',
        cleanup_scripts: 'viewport_3',
        exclusions: 'viewport_4',
        clone_instances: 'viewport_5',
        multi_instances_view: 'viewport_6',
        clone_profile: 'viewport_7'
    };

    const tableMap = {
        preservers: 'clone_data_preserver',
        cleanup_scripts: 'clone_cleanup_script',
        exclusions: 'clone_data_exclude',
        clone_instances: 'instance',
        //multi_instances_view: '',
        clone_profile: 'clone_profile'
    };

    // Map button elementId to node key
    const buttonMap = {
        'button_1': 'exclusions',
        'button_2': 'preservers',
        'button_3': 'cleanup_scripts',
        'button_4': 'clone_profile',
        'button_5': 'clone_instances',
        'button_6': 'multi_instances_view'
    };

    let nodeKey;

    if (event.payload.item) {
        // Content tree click
        nodeKey = event.payload.item.id;
    } else {
        // Button click
        nodeKey = buttonMap[event.elementId];
    }


    if (!nodeKey || nodeKey === 'overview') {
        api.setState('cardView', true);
        api.setState('showListView', false);
        api.setState('activeViewport', '');
        api.setState('selectedNavItems', [
            ['overview']
        ]);
        return;
    }
    const viewportId = viewPortMap[nodeKey];
    const table = tableMap[nodeKey];

    api.setState('selectedNavItems', [
        [nodeKey]
    ]);

    api.setState('cardView', false);
    api.setState('showListView', true);
    api.setState('activeViewport', viewportId);

    if (nodeKey === 'multi_instances_view') {
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
            viewportElementId: viewportId,
            route: 'mif'
        });
        return;
    }

    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
            viewportElementId: viewportId,
            route: 'list',
            fields: {
                table: table
            },
            params: {
                t: String(Date.now())
            }});
    }
