/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const constants = {
        NOT_APPLICABLE_TEXT: await helpers.translate('Not applicable'),
        NO_AUDITS_TEXT: await helpers.translate('No audits are currently set up'),
        NO_RULES_TEXT: await helpers.translate('No rules are currently set up'),
        HEALTH_INCLUSION_RULE_TEXT: await helpers.translate('Not applicable because of health inclusion rule'),
        IDENTIFICATION_INCLUSION_RULE_TEXT: await helpers.translate('Not applicable because of identification inclusion rule'),
        DEDUP_REMEDIATION_TEXT: await helpers.translate('Applicable de-duplication tasks have been remediated'),
        MISSING_REQUIRED_TEXT: await helpers.translate('Missing required'),
        MISSING_RECOMMENDED_TEXT: await helpers.translate('Missing recommended'),
        NOT_YET_REVIEWED_TEXT: await helpers.translate('Not Yet Reviewed'),

        INVALID_METRIC_TEXT: await helpers.translate('Invalid metric'),
        STALE_METRIC_FAILED_TEXT: await helpers.translate('Stale'),
        STALE_METRIC_PASSED_TEXT: await helpers.translate('Up-to-date'),
        DUPLICATE_METRIC_FAILED_TEXT: await helpers.translate('Duplicates found'),
        DUPLICATE_METRIC_PASSED_TEXT: await helpers.translate('No duplicates found'),
        ORPHAN_METRIC_FAILED_TEXT: await helpers.translate('No relationships'),
        ORPHAN_METRIC_PASSED_TEXT: await helpers.translate('Has relationships'),
        AUDIT_METRIC_FAILED_TEXT: await helpers.translate('Non-compliant'),
        AUDIT_METRIC_PASSED_TEXT: await helpers.translate('Compliant'),

        CORRECTNESS_LABEL: await helpers.translate('Correctness'),
        COMPLIANCE_LABEL: await helpers.translate('Compliance'),
        COMPLETENESS_LABEL: await helpers.translate('Completeness'),
        RELATIONSHIP_LABEL: await helpers.translate('Relationship'),
        ATTESTATION_LABEL: await helpers.translate('Attestation'),
        ATTESTATION_STATUS_LABEL: await helpers.translate('Status'),
        ATTESTATION_ATTESTED_ON_LABEL: await helpers.translate('Attested on'),

        CORRECTNESS_INFO_TEXT: await helpers.translate('Checks for orphan, stale, and duplicate CIs.'),
        COMPLIANCE_INFO_TEXT: await helpers.translate('Provides the latest Audit run results, in which actual values of specified fields are compared against expected values defined in template and scripted audits.'),
        COMPLETENESS_INFO_TEXT: await helpers.translate('Checks whether fields that are specified as required or recommended, aren’t populated.'),
        RELATIONSHIP_INFO_TEXT: await helpers.translate('Checks for duplicate, and stale relationships.'),
        ATTESTATION_INFO_TEXT: await helpers.translate('Verifies the existence of actual IT infrastructure and applications that you own.')
    };
    api.setState("constants", constants);
}
