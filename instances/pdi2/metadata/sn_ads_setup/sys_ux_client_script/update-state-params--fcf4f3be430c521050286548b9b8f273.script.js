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
    if (!event) return;
    // Due to some defect in sn-forms component tabTitle comes as 'Create new interaction' so overriding it with correct name.
    api.emit('SCREEN_STATUS_CHANGED', {
        'title': api.context.props.title || "Tasks"
    });

    const {
        name,
        elementId,
        payload
    } = event;

    const result = payload.data.output.result;
    const error = result.error;
    if (error) {
        api.setState('showAlert', true);
        api.setState('alertMsg', error);
    } else {
        const activityView = {
            FOCUSED: 'focused',
            STACKED: 'stacked'
        };

        const layoutConfig = {
            'focused_view': {
                isFocusedPickerHidden: false,
                showStages: false,
                activityView: activityView.FOCUSED
            },
            'vertical_focused': {
                isFocusedPickerHidden: true,
                showStages: true,
                activityView: activityView.FOCUSED
            },
            'vertical_stacked': {
                isFocusedPickerHidden: true,
                showStages: true,
                activityView: activityView.STACKED
            },
            'horizontal_focused': {
                isFocusedPickerHidden: true,
                showStages: false,
                activityView: activityView.FOCUSED
            },
            'horizontal_stacked': {
                isFocusedPickerHidden: true,
                showStages: false,
                activityView: activityView.STACKED
            }
        };

        const {
            interactionSysId,
            setupName,
            setupDescription,
            setupLayout,
        } = result;
        
        // As this page can be used as template, added selectedStage, selectedActivity as variable to avoid including it in restOptionalParams.
        const {
            setupLayout: setupLayoutFromProps,
        } = api.context.props;

        const layoutTypes = Object.keys(layoutConfig);
        const setupLayoutFromUrl = setupLayoutFromProps && layoutTypes.includes(setupLayoutFromProps) && setupLayoutFromProps || null;
    
        api.setState('interactionId', interactionSysId);
        api.setState('layoutConfig', layoutConfig[setupLayoutFromUrl || setupLayout]);
        api.setState('setupName', setupName);
        api.setState('setupDescription', setupDescription);
    }
}
