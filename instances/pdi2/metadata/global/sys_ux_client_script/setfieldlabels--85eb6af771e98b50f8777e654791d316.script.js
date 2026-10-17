/**
 * Single place that resolves the user-facing labels for the EF Error Card List component
 * (88ed60bd): applies per-field overrides from the `fieldLabels` prop, translates each label,
 * and stores the result in the `field_labels` client state. Other scripts (e.g. the sort-by
 * dropdown transform) read from `field_labels` — so translation happens exactly once, here.
 * Runs on MACROPONENT_READY.
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
        occurrences: 'Occurrences',
        severity: 'Severity',
        category: 'Category',
        refined_code: 'Refined Code',
        domain: 'Domain'
    };

    const fields = Object.keys(defaultLabels);
    Object.keys(labelOverride).forEach(function (field) {
        if (fields.indexOf(field) === -1) { fields.push(field); }
    });

    // Resolve per field: override value (translate) > built-in literal default (translate).
    // labelOverride is a JSON prop with no translatable metadata, so its values are
    // translated explicitly here.
    const resolved = await Promise.all(fields.map(async function (field) {
        // `!= null` (not a truthiness check) so an explicit empty-string override is honored
        // (clears the label) while missing/undefined falls through to the built-in default.
        if (labelOverride[field] != null) {
            return [field, await helpers.translate(labelOverride[field])];
        }
        return [field, await helpers.translate(defaultLabels[field])];
    }));

    const fieldLabels = {};
    resolved.forEach(function (entry) { fieldLabels[entry[0]] = entry[1]; });

    api.setState('field_labels', fieldLabels);
}
