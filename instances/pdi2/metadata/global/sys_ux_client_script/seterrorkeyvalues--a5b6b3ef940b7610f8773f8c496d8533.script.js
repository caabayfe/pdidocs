
/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({ api, imports }) {

    const record = api.data.fetch_error_record?.result;

    if (!record) {
        api.setState('error_overview', []);
        return;
    }

    const labels = api.state.field_labels || {};
    const keyColumnDisplayName = labels.key || 'Key';
    const errorSourceColumnDisplayName = labels.error_source || 'Error source';
    const stateLabel = labels.state || 'State';
    const consecutiveLabel = labels.consecutive_count || 'Consecutive #';
    const reopenedLabel = labels.reopened_count || 'Re-opened';
    const lastOccurrenceLabel = labels.last_occurrence || 'Last occurrence';

    const { escapeHtml, getStateColor } = imports["global.EFClientUtils"]();

    const keyValue = record.key?.displayValue || '';
    const stateValue = record.state?.value || '';
    const stateDisplay = record.state?.displayValue || '';
    const errorSourceDisplay = record.error_source?.displayValue || '';
    const errorSourceSysId = record.error_source?.value || '';
    const errorSourceTable = record.error_source_table?.value || '';
    const consecutiveCount = record.consecutive_count?.displayValue || '0';
    const reopenedCount = record.reopened_count?.displayValue || '0';
    const lastOccurrence = record.last_occurrence?.displayValue || '';

    const stateColor = getStateColor(stateValue);

    // Dynamic workspace link using table + sys_id
    const errorSourceHref = "javascript:void(0)";

    const reopenedValue = parseInt(reopenedCount) || 0;
    const formattedReopenedCount = reopenedValue === 1 ? '1 time' : `${reopenedValue} times`;

    const result = [
        [
            {
                label: keyColumnDisplayName,
                value: {
                    type: "html",
                    value: `<span style="font-weight: 700;">${escapeHtml(keyValue)}</span>`
                }
            }
        ],
        [
            {
                label: stateLabel,
                value: {
                    color: stateColor,
                    label: stateDisplay,
                    type: "highlighted-value"
                }
            }
        ],
        [
            {
                label: errorSourceColumnDisplayName,
                value: {
                    type: "text-link",
                    label: errorSourceDisplay,
                    href: errorSourceHref,
                    underlined: true,
                    table: errorSourceTable,
                    sysId: errorSourceSysId
                }
            }
        ],
        [
            {
                label: consecutiveLabel,
                value: {
                    type: "html",
                    value: `<span style="font-weight: 700;">${escapeHtml(consecutiveCount)}</span>`
                }
            }
        ],
        [
            {
                label: reopenedLabel,
                value: {
                    type: "html",
                    value: `<span style="font-weight: 700;">${escapeHtml(formattedReopenedCount)}</span>`
                }
            }
        ],
        [
            {
                label: lastOccurrenceLabel,
                value: {
                    type: "html",
                    value: `<span style="font-weight: 700;">${escapeHtml(lastOccurrence)}</span>`
                }
            }
        ]
    ];

    api.setState('error_overview', result);
}
