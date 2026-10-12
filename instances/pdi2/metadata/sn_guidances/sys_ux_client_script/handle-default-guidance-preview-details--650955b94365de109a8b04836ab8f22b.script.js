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
    const customGuidanceHelper = imports["sn_guidances.AttachArticleGuidanceHelper"](...arguments);
    const {
        customExpProps
    } = event.payload;
    const {
        actionStateValue,
        recommendationHint,
        icon,
        actionInputs
    } = customExpProps;
    let {
        search_table,
        search_sys_id,
        search_result_title,
        search_result_preview,
        search_teaser_text
    } = actionInputs;
    const statusProps = await customGuidanceHelper.getStatusProps(actionStateValue, recommendationHint, '', icon);
    search_table = search_table && search_table.trim();
    search_sys_id = search_sys_id && search_sys_id.trim();
    search_result_title = search_result_title && search_result_title.trim();
    const searchTeaserText = search_teaser_text && search_teaser_text.trim();

    /* Parsing the string to get JSON object if someone fills the JSON manually as a string in the Guidance Input. */
    if (typeof search_result_preview === 'string') {
        try {
            search_result_preview = JSON.parse(search_result_preview);
        } catch (error) {
            console.error("Failed to parse JSON for Search result preview fields: " + error.message);
            search_result_preview = {};
        }
    }

    /* Parsing string as HTML using DOMPraser, replacing special html code with appropriate character value. */
    const guidanceHeading = customGuidanceHelper.getTrimmedValue(search_result_title);
    const cardHeading = {
        label: guidanceHeading
    };

    /* Fields to exclude */
    const excluded_fields = ['sys_id', 'table', 'Table'];
    /* Fields to prioritize */
    const most_priority_fields = ['Number', 'Name'];
    let prioritizedFields = [],
        otherFields = [];
    
    if (
    search_result_preview &&
    Array.isArray(search_result_preview.previewFields) && 
    search_result_preview.previewFields.length > 0 && 
    search_result_preview.previewFields.every(field => 'label' in field && 'displayValue' in field)
) {
        // Create prioritized fields in the sequence of most_priority_fields (keep Number, Name in front)
        prioritizedFields = most_priority_fields
            .map(fieldLabel => search_result_preview.previewFields.find(field => field.label === fieldLabel))
            .filter(field =>
                field &&
                !excluded_fields.includes(field.label) &&
                (field.displayValue && field.displayValue.trim()) !== guidanceHeading // Exclude if displayValue matches heading
            )
            .map(field => ({
                label: field.label,
                value: field.displayValue && field.displayValue.trim()
            }));

        // Create other fields, excluding `excluded_fields`, prioritized fields, and fields matching `heading`
        otherFields = search_result_preview.previewFields
            .filter(field =>
                !excluded_fields.includes(field.label) &&
                !most_priority_fields.includes(field.label) &&
                (field.displayValue && field.displayValue.trim()) !== guidanceHeading // Exclude if displayValue matches heading
            )
            .map(field => ({
                label: field.label,
                value: field.displayValue && field.displayValue.trim()
            }));
    }
    /* Combine prioritized fields and other fields */
    const fieldsToDisplay = [...prioritizedFields, ...otherFields];
    /* Setting the client states */
    api.setState('customExpProps', customExpProps);
    api.setState('heading', ({
        currentValue
    }) => ({
        ...currentValue,
        ...cardHeading
    }));
    api.setState('fieldsToDisplay', fieldsToDisplay);
    api.setState('statusProps', statusProps);
    api.setState('searchTeaserText', searchTeaserText);
    api.setState('recordTable', search_table);
    api.setState('recordSysId', search_sys_id);
    api.setState('actionStateValue', actionStateValue);
}
