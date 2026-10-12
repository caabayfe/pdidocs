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

    const {
        actionStateValue,
        recommendationHint,
        attributes,
        icon
    } = customExpProps;

    const completionMessage = attributes ? attributes['completionMessage'] : '';
    const statusProps = await getStatusProps(actionStateValue, recommendationHint, completionMessage, icon);
    api.setState('actionDetailSysId', customExpProps.sysId);
    api.setState('actionStateValue', actionStateValue);
    api.setState('statusProps', statusProps);
    api.setState('customExpProps', customExpProps);

    if (actionStateValue == 'completed') {
        api.setState('shouldFetchKnowledge', true);
        api.emit('FETCH_KNOWLEDGE_ID_BY_RECOMMENDED_BY');
    }
    const summarizedText = customExpProps.actionInputs ?
        customExpProps.actionInputs.summarized_text :
        "";
    api.setState('summarizedText', summarizedText);


    let citationButtons = [];
    if (customExpProps.actionInputs && customExpProps.actionInputs.citations) {
        // parse citations string or default to []
        citationButtons = JSON.parse(customExpProps.actionInputs.citations || "[]");
        if (!Array.isArray(citationButtons)) {
            citationButtons = [];
        }
    }

    // Map to get labels and URLs
    citationButtons = citationButtons.map(function(citation) {
        return {
            label: citation && citation.number ? citation.number : "",
            url: citation && citation.url ? citation.url : ""
        };
    });
    api.setState('citationsList', citationButtons);

    if (actionStateValue !== 'completed') {
        api.setState('citations', citationButtons);
        api.setState('citationCount', citationButtons.length);
        api.setState('dataFetched', true);
    }

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
