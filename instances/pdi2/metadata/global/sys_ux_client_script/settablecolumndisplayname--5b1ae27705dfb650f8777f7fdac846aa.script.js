/**
 * Single place that resolves every user-facing label for the EF Error Code And Errors List
 * component (list columns + detail key-value fields), applies per-field overrides, translates,
 * and stores the result in the `field_labels` client state. Other client scripts
 * (SetErrorKeyValues, SetErrorHeaderKeyValues) and the table transform (EFCustomizeTableData)
 * read labels from `field_labels` — so translation happens exactly once, here.
 *
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
    const props = api.context.props || {};

    const labelOverride = (props.fieldLabels && typeof props.fieldLabels === 'object')
        ? props.fieldLabels : {};

    // Built-in default labels (English literals we own → translated here).
    const defaultLabels = {
        key: 'Key',
        state: 'State',
        consecutive_count: 'Consecutive #',
        reopened_count: 'Re-opened',
        error_source: 'Error source',
        refined_on: 'Refined on',
        last_occurrence: 'Last occurrence',
        severity: 'Severity',
        category: 'Category',
        refined_code:'Refined code',
        errors:'Errors',
        context:'Context',
        error_details:'Error details',
        properties:'Properties'
    };

    // Legacy display-name props are translatable string props — already localized by the
    // platform, so they are used directly (never re-translated).
    const legacyLabels = {
        key: props.keyColumnDisplayName,
        error_source: props.errorSourceColumnDisplayName
    };

    const fields = Object.keys(defaultLabels);
    Object.keys(labelOverride).forEach(function (field) {
        if (fields.indexOf(field) === -1) { fields.push(field); }
    });

    // Resolve per field: override (translate) > legacy translatable prop (direct) >
    // built-in literal default (translate). labelOverride is a JSON prop with no
    // translatable metadata, so its values are translated explicitly here.
    const resolved = await Promise.all(fields.map(async function (field) {
        // `!= null` (not a truthiness check) so an explicit empty-string override is honored
        // (clears the label) while missing/undefined falls through to legacy/default.
        if (labelOverride[field] != null) {
            return [field, await helpers.translate(labelOverride[field])];
        }
        if (legacyLabels[field] != null) {
            return [field, legacyLabels[field]];
        }
        return [field, await helpers.translate(defaultLabels[field])];
    }));

    const fieldLabels = {};
    resolved.forEach(function (entry) { fieldLabels[entry[0]] = entry[1]; });

    api.setState('field_labels', fieldLabels);
}
