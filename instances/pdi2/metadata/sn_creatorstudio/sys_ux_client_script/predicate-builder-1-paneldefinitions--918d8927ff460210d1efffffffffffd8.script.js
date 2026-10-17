/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const results = api.data.predicate_builder_controller_1.panelDefinitions || {};
    const newResults = {};
    const questionsOnly = api.context.props.questionsOnly;

    const questions = {
        itemType: 'ITEM',
        internalValue: 'variables',
        displayValue: helpers.translateSync('Questions'),
        reference: 'variable~question',
        selectable: true,
        initialPanelOnly: true,
    };

    /** 
     * If questionsOnly is true, only questions are returned. This is currently used 
     * to support the question form in the Request Builder where only questions are 
     * used in conditions.
     * 
     * Otherwise, we attach questions if the results do not contain them. This is to support 
     * questions in conditions for non-task tables. The predicate builder supports questions for task tables OOB.
     * 
     */
    Object.keys(results).forEach(key => {
        const panelDefinition = results[key];
        const isWrapped = panelDefinition && !Array.isArray(panelDefinition) && Array.isArray(panelDefinition.items);
        const items = isWrapped ? panelDefinition.items : (Array.isArray(panelDefinition) ? panelDefinition : []);
        let filteredPanels = items.filter(obj => obj.internalValue !== 'request_type');
        if (questionsOnly) {
            newResults[key] = isWrapped ? { ...panelDefinition, items: [questions] } : [questions];
        } else {
            const hasQuestions = filteredPanels.some(item => item.internalValue === 'variables');
            if (!hasQuestions)
                filteredPanels = [...filteredPanels, questions];
            newResults[key] = isWrapped ? { ...panelDefinition, items: filteredPanels } : filteredPanels;
        }
    });

    return newResults;
}
