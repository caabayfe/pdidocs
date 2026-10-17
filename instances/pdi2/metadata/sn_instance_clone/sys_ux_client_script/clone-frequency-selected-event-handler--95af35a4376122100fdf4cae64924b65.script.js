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
    const handlerUtil = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    var selectedCloneFrequency = event.payload.value;
    var frequencyCard = JSON.parse(JSON.stringify(api.state.frequencyCard));
    frequencyCard.cloneFrequency.selected = selectedCloneFrequency;
    api.setState('cloneFrequencySummaryValue', event.payload.item.label);
    switch (selectedCloneFrequency) {
        case "0":
            handlerUtil.resetControlsForFrequencyCard(frequencyCard);
            handlerUtil.validateCloneRequest({"frequencyCard": frequencyCard});
            break;
        case "1":
            handlerUtil.resetControlsForFrequencyCard(frequencyCard);
            frequencyCard.weeklyBiweekly.show = true;
            frequencyCard.occurrences.show = true;
            frequencyCard.weeklyBiweekly.label = frequencyCard.weeklyBiweekly.weeklyLabel;
            handlerUtil.getMaxCloneOccurrences(frequencyCard);
            break;
        case "2":
            handlerUtil.resetControlsForFrequencyCard(frequencyCard);
            frequencyCard.weeklyBiweekly.show = true;
            frequencyCard.occurrences.show = true;
            frequencyCard.weeklyBiweekly.label = frequencyCard.weeklyBiweekly.biweeklyLabel;
            handlerUtil.getMaxCloneOccurrences(frequencyCard);
            break;
        case "3":
            handlerUtil.resetControlsForFrequencyCard(frequencyCard);
            frequencyCard.weeklyBiweekly.show = true;
            frequencyCard.occurrences.show = true;
            frequencyCard.weeklyBiweekly.label = frequencyCard.weeklyBiweekly.monthlyLabel;
            handlerUtil.getMaxCloneOccurrences(frequencyCard);
            break;
    }
}
