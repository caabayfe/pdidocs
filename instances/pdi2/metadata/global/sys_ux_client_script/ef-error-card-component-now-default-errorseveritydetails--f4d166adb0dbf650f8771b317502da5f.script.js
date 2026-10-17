/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    function getSeverityDetails(severityLabel) {
        const label = severityLabel ? String(severityLabel).trim() : "Low";
        const normalized = label.toLowerCase();

        const priority_map = {
            critical: "critical",
            high: "high",
            medium: "moderate",
            low: "low",
            info: "info",
        };

        const displayLabel =
            label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();

        const color = priority_map[normalized] || "low";

        return {
            Label: displayLabel,
            color: color,
        };
    }

    return getSeverityDetails(api.item.value.severity_label);
}
