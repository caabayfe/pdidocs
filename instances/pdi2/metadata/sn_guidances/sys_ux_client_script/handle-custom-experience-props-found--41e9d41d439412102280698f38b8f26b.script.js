/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        customExpProps
    } = event.payload;

    api.setState('customExpProps', customExpProps);
    const {
        actionStateValue,
        recommendationHint,
        attributes,
        icon
    } = customExpProps;
    const completionMessage = attributes ? attributes['completionMessage'] : '';
    const statusProps = await getStatusProps(actionStateValue, recommendationHint, completionMessage, icon);
    api.setState('actionStateValue', actionStateValue);
    api.setState('statusProps', statusProps);
    api.setState('knowledgeArticleId', customExpProps.actionInputs.knowledge);

    async function getStatusProps(actionStateValue, recommendationHint, completionMessage, icon) {
        var hintColor = 'low';
        var hintLabel = recommendationHint;
        var hintIcon = icon;

        switch (actionStateValue) {
            case 'new':
            case 'in_progress':
                hintColor = 'teal';
                break;
            case 'completed':
                hintColor = 'positive';
                hintIcon = 'circle-check-outline';
                hintLabel = completionMessage;
                break;
            case 'skipped':
                hintColor = 'pink';
                hintIcon = 'circle-exclamation-outline';
                hintLabel = await helpers.translate("This recommendation was dismissed");
                break;
            case 'error_skipped':
            case 'in_error':
                hintColor = 'critical';
                hintIcon = 'circle-close-fill';
                hintLabel = await helpers.translate("This action couldn't be completed");
                break;
        }
        if (hintLabel == undefined) {
            hintLabel = await helpers.translate("This action has been completed");
        }
        let statusProps = {
            hintColor: hintColor,
            hintLabel: hintLabel,
            hintIcon: hintIcon,
        };
        return statusProps;
    }

}
