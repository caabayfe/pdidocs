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
    if (event.name !== "SN_NACM#AMB_MESSAGE_RECEIVED")
        return;

    const articleId = api.data.record.sysId;
    const isError = event.payload.status && event.payload.status === 'error';
    if (isError) {
        api.setState('isOpenPromptLoading', false);
        return;
    }

    const feature = event.payload.features ? event.payload.features[articleId] : null;
    if (feature == null) {
        return;
    }

    if (feature.result && feature.result.response === 'ack') {
        api.setState('currentOpenPromptTransaction', feature.result.contextId);
    }

    const response = feature.result.apiResult;
    if (!response || !response.success) {
        return;
    }

    const content = response.output;
    if (!content) return;

    const nacmPageConfig = {...(api.state.nacmPageConfig || {})};
    nacmPageConfig.recommendationDialogProperties.closeButtonTooltip = await helpers.translate('Close');
    api.setState('nacmPageConfig', nacmPageConfig);
    api.setState('isOpenPromptLoading', false);

    let doc;
    try {
        const parser = new DOMParser();
        doc = parser.parseFromString(content, 'text/html');
    } catch (e) {
        console.error('Open Prompt Error: Unable to parse document');
        return;
    }

    const fieldsMap = api.data.record?.form?.fields || {};

    const selectedTextId = feature.result.selectedTextId;
    if (selectedTextId) {
        const snippet = doc.querySelector('snippet');
        let content = snippet ? snippet.innerHTML : doc.body.innerHTML;
        content = `${content}`;
        const payload = [{
            id: selectedTextId,
            content: content,
            replace: true,
            generated: true,
            loading: false
        }];
        api.setState('eceUpdateContentParams', payload);
    } else {
        const templateData = response.templateData;
        const eceContent = [];
        for (const i in templateData) {
            const {
                fieldName,
                fieldLabel,
                fieldType
            } = templateData[i];
            const val = doc.querySelector(`form_field[name="${fieldName}"]`);
            if (fieldType === 'html') {
                const fieldData = fieldsMap[fieldName];

                // note: because currently ECE does not safeguard the section, open prompt need to set all the fields/sections
                // otherwise, the sections can potentially be lost after generation.
                // however, this might also override a non-empty section back to empty but this is fine for now because
                // this logic only happen when the article is blank, revise this logic when we start to support regeneration
                // on top of existing article.
                
                eceContent.push({
                    id: fieldName,
                    label: fieldData.dictionary ? fieldData.dictionary.label : fieldLabel,
                    value: val? val.innerHTML: '',
                    uid: Date.now()
                });
            } else if (val) {
                api.emit('GEN_AI_SET_FIELD', {
                    fieldName,
                    value: val.innerText.trim()
                });
            }
        }
        api.setState('eceHTMLFields', eceContent);
    }
}
