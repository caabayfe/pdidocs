/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, helpers }) {
    const {
        mode,
        baseId,
        pageSysId,
        screenId,
        parentScreenId,
        parentElementId,
        experience,
        subroutes
    } = api.context.props;

    if (!experience) {
        console.log('Perform Redirect: No experience');
        return;
    }

    const hasParentInfo = parentScreenId && parentElementId;

    const payload = {
        fields: {
            mode
        },
        params: hasParentInfo ? {
            parentScreenId,
            parentElementId
        } : {}
    };

    const routes = hasParentInfo ? subroutes : experience.routes;

    const routeId = pageSysId ? routes.find(r => r.screenCollection.sysId === pageSysId)?.sysId : null;

    
    const modeViewMap = {
        experience: 'experience',
        pc: 'pc',
        components: 'components'
    };

    const modeBaseIdNameMap = {
        experience: 'experienceId',
        pc: 'extensionpointId',
        components: 'macroponentId'
    };

    // Should go to a /edit route
    if (baseId && pageSysId && screenId) {
        payload.route = 'edit';
        payload.fields.experienceId = experience.sysId;
        payload.fields.routeId = routeId;
        payload.fields.screenId = screenId;
    } else if (baseId && pageSysId) {
        // Should go to a /page-settings route
        payload.route = 'page-settings';
        payload.fields.experienceId = experience.sysId;
        payload.fields.routeId = routeId;
    } else if (baseId && mode in modeViewMap) {
        // Should go to a View route for the mode
        payload.route = modeViewMap[mode];
        payload.fields = { [modeBaseIdNameMap[mode]]: experience.sysId };
    } else {
        // Should probably never happen, but go home
        payload.route = 'home';
        payload.fields = {};
        payload.params = {};
    }

    helpers.timing.setTimeout(() => {
        api.emit('NAV_ITEM_SELECTED', payload);
    }, 1000);
}
