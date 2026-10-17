/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function handler({ api, imports }) {

    const response = api.data.error_code_details?.result;

    if (!response) {
        api.setState('header_key_values', []);
        return;
    }

    const severityValue = response.severity_label?.value || '';
    const severityDisplay = response.severity_label?.displayValue || '';
    const errorCode = response.error_code?.displayValue || '';
    const categoryDisplay = response.error_category?.displayValue || '';

    const labels = api.state.field_labels || {};
    const severityLabel = labels.severity || 'Severity';
    const refinedCodeLabel = labels.refined_code || 'Refined code';
    const categoryLabel = labels.category || 'Category';

    const { getSeverityColor } = imports["global.EFClientUtils"]();

    const color = getSeverityColor(severityValue);

    const result = [
        {
            label: severityLabel,
            value: {
                type: "highlighted-value",
                color: color,
                label: severityDisplay
            }
        },
        {
            label: refinedCodeLabel,
            value: {
                type: "string",
                value: errorCode
            }
        },
        {
            label: categoryLabel,
            value: {
                type: "string",
                value: categoryDisplay
            }
        }
    ];

    api.setState('header_key_values', result);
}
