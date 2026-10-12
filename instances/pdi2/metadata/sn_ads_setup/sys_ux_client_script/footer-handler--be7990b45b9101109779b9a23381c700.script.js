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

    const isTableFooterEvent = event.name === 'SN_HELP_SETUP_FOOTER#PRIMARY_CLICKED' && api.state.detailTask.configuration_types === "table";
    const isPluginFooterEvent = event.name === 'SN_HELP_SETUP_FOOTER#PRIMARY_CLICKED' && api.state.detailTask.configuration_types === "install_plugin";

    if (api.state.isTaskCompleted && !isPluginFooterEvent)
        return;

    if (isTableFooterEvent) {
        api.data.gform.save();
        return;
    }

    if (event.name === "SN_FORM_DATA_CONNECTED#FETCH_SUCCESS") {
        const {
            enabled,
            canCreateGlobalTags
        } = event.payload.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideViewableTagQuery_Query.viewableRecordTags;

        if (!enabled && !canCreateGlobalTags)
            return;
    }
    const moveToNextStep = () => {
        const {
            taskId,
            groups: categories,
            taskList,
            categoryId
        } = api.state;
        let route, fields, params = {},
            markAsComplete = false;
        let currentTaskIndex = taskId ? taskList.findIndex(step => step.sys_id === taskId) : 0;
        let header = null;
        let controlExternalTask = null;
        if (api.context.props && api.context.props.hidePolarisHeader == 'true') {
            header = 'true';
        }
        if (api.context.props && api.context.props.controlExternalTask == 'true') {
            controlExternalTask = 'true';
        }
        //Move to next task if task is available 
        if (currentTaskIndex + 1 < taskList.length) {
            route = 'tasks';
            fields = {
                setupId: api.context.props.setupId
            };
            params = {
                'categoryId': categoryId,
                'taskId': taskList[currentTaskIndex + 1].sys_id,
                'hidePolarisHeader': header,
                'controlExternalTask': controlExternalTask
            };
            markAsComplete = taskList[currentTaskIndex + 1].interactionStatus === 'Completed';
        } else {

            let currentCategoryIndex = categories.findIndex(category => category.sys_id === api.context.props.categoryId);

            if (currentCategoryIndex === categories.length - 1) { 
                //Last category - Move to all categories
                if (header) {
                    // If in embed mode, move to first category
                    route = 'tasks';
                    fields = {
                        setupId: api.context.props.setupId
                    };
                    params = {
                        'categoryId': categories[0].sys_id,
                        'hidePolarisHeader': header,
                        'controlExternalTask': controlExternalTask
                    };
                } else {
                    const timeStamp = new Date().getTime();
                    route = 'setup';
                    fields = {
                        sysId: api.context.props.setupId
                    };
                    params = {
                        'customId': timeStamp,
                        'hidePolarisHeader': header,
                        'controlExternalTask': controlExternalTask
                    };
                }
                
            } else { //Move to next category
                route = 'tasks';
                fields = {
                    setupId: api.context.props.setupId
                };
                params = {
                    'categoryId': categories[currentCategoryIndex + 1].sys_id,
                    'hidePolarisHeader': header,
                    'controlExternalTask': controlExternalTask
                };
            }
        }
        api.emit('NAV_ITEM_SELECTED', {
            route,
            fields,
            params
        });
        api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS');
        api.setState('isLocked', false);
        api.setState('markAsComplete', markAsComplete);
        api.setState('selectedTaskId', [
            []
        ]);
    };

    if (api.state.detailTask.configuration_types === "install_plugin") {
        if (api.state.installPlugins.length > 0) {
            helpers
                .translate('Failed to install Plugins.')
                .then((msg) => {
                    api.setState('pluginFailMsg', msg);
                });
            api.emit('MODAL_SELECTED', {
                modalId: "[component-id$='installing_plugins_modal']",
                showModal: true,
                bare: true,
                displayOptions: {
                    size: "md"
                }
            });
        } else {
            //Move to next category, if category is not available move to categories page
            moveToNextStep();
        }
    } else
        moveToNextStep();
}
