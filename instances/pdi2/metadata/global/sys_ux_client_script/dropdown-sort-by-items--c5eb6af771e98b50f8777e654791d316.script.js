/**
 * Builds the sort-by dropdown options for the EF Error Card List component (88ed60bd) from
 * the already-resolved `field_labels` client state (set by SetCardFieldLabels). Labels are
 * NOT translated here — `field_labels` already holds translated values; the `fallback`
 * strings are only used before `field_labels` is populated. Option ids match the existing
 * `<field>|asc` / `<field>|desc` sort tokens, so sort behaviour is unchanged. Bound to the
 * dropdown's items property.
 *
 * @param {params} params
 * @param {api} params.api
 */
function evaluateProperty({ api }) {
    const labels = api.state.field_labels || {};

    // sort field token -> field_labels key + fallback (used only before field_labels is set).
    const sortFields = [
        { field: 'error_code',          labelKey: 'refined_code', fallback: 'Refined Code' },
        { field: 'error_category',      labelKey: 'category',     fallback: 'Category' },
        { field: 'error_code.severity', labelKey: 'severity',     fallback: 'Severity' },
        { field: 'error_count',         labelKey: 'occurrences',  fallback: 'Occurrences' }
    ];

    const directions = [
        { suffix: 'asc',  icon: 'caret-up-fill' },
        { suffix: 'desc', icon: 'caret-down-fill' }
    ];

    const options = [];
    sortFields.forEach(function (sortField) {
        const label = labels[sortField.labelKey] || sortField.fallback;
        directions.forEach(function (direction) {
            options.push({
                id: sortField.field + '|' + direction.suffix,
                icon: direction.icon,
                label: label,
                avatarProps: { configAria: null },
                image: { alt: null, src: null },
                supplementalIcon: { icon: null, label: null }
            });
        });
    });

    return options;
}
