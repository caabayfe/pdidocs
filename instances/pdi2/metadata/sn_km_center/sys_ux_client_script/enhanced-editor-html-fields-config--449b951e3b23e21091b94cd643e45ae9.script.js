/**
 * HTML Field Config Client Script for Knowledge Articles
 *
 * This script identifies HTML and translated HTML fields from the current record and
 * stores them in the state for further processing. It supports both initial page load
 * and field value change events.
 * 
 *
 */
function handler({
    api,
    event
}) {
    //Notify ECE to enable content update events
    api.setState('enableContentUpdates', true);

    let htmlFields = [];

    // Handle Wiki Article Type and MarkDown: set state flag 
    if (api.data.record?.form?.fields) {
        const isWikiArticle = api.data.record.form.fields.wiki?.visible || false;
        api.setState('isWikiArticle', isWikiArticle);
        const isMarkDown = api.data.record.form.fields.markdown?.visible || false;
        api.setState('isMarkdown', isMarkDown);
        api.setState('articleType', api.data.record.form.fields.article_type?.value || 'text');
    }

    // Get fields from the current form
    const fieldsMap = api.data.record?.form?.fields || {};

    // Iterate through fields and extract those of type 'html' or 'translated_html'
    for (const fieldName in fieldsMap) {
        const fieldData = fieldsMap[fieldName];
        const fieldType = fieldData.dictionary ? fieldData.dictionary.type : fieldData.type;
        if (fieldType === 'html' || fieldType === 'translated_html') {
            htmlFields.push({
                id: fieldData.name,
                label: fieldData.dictionary ? fieldData.dictionary.label : null,
                value: fieldData.value || null,
                isMandatory: fieldData.mandatory || false
            });
        }
    }

    // Special handling for non-knowledge tables
    if (api.data.record?.table !== "kb_knowledge" && api.data.record?.table !== "kb_knowledge_block") {
        // Remove Article Body (text field) from HTML fields for non-kb_knowledge tables
        // This maintains consistency with legacy policy
        htmlFields = htmlFields.filter(field => field.id !== 'text');
    }

    // Store the extracted HTML fields in component state 
    api.setState('eceHTMLFields', htmlFields);
    api.setState('articleFields', htmlFields.map(field => {
        return {id: field.id, label: field.label};
    }));

}
