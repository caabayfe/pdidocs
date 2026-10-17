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
    var rows = (api.data['get_ipki_migration_list_rows'] &&
        api.data['get_ipki_migration_list_rows'].output &&
        api.data['get_ipki_migration_list_rows'].output.rows) || [];

    var STATUS_FILTERS = {
        notStarted: function(r) {
            return r.status.value === 'not_started';
        },
        inProgress: function(r) {
            return r.status.value === 'pre_flight' ||
                r.status.value === 'registration' ||
                r.status.value === 'cert_issued';
        },
        succeeded: function(r) {
            return r.status.value === 'succeeded';
        },
        failed: function(r) {
            return r.status.value === 'failed';
        },
        eligible: function(r) {
            return true;
        }
    };
    var cardFilter = api.state.migrationSelectedCardFilter;
    var statusFilter = (cardFilter && STATUS_FILTERS[cardFilter]) || function() {
        return true;
    };

    // Migratable = retryable status + MID up + MID validated.
    // Non-migratable rows render with the checkbox disabled (selectionDisabled = true).
    function isMigratable(r) {
        return (r.status.value === 'not_started' || r.status.value === 'failed') &&
            r.midStatus === 'Up' &&
            r.midValidated;
    }

    var notValidatedMessage = await helpers.translate(
        'mid_setup_migration_not_validated_message',
        'This server is not validated and cannot be migrated. Refresh this table once validated.'
    );

    function buildRow(r) {
        var details = r.details;
        if (!details && r.midStatus === 'Up' && !r.midValidated) {
            details = notValidatedMessage;
        }

        return {
            key: r.key,
            selectionDisabled: !isMigratable(r),
            cells: {
                midName: {
                    value: r.midName,
                    displayValue: r.midName,
                    secondaryLabel: r.midHostName
                },
                status: {
                    value: r.status.value,
                    displayValue: r.status.label,
                    componentProps: {
                        label: r.status.label,
                        color: r.status.color,
                        size: 'sm'
                    }
                },
                details: {
                    value: details,
                    displayValue: details
                },
                elapsed: {
                    value: r.elapsed,
                    displayValue: r.elapsed
                }
            }
        };
    }

    function defsFor(bucket) {
        return {
            rows: rows.filter(function(r) {
                return r.bucket === bucket && statusFilter(r);
            }).map(buildRow)
        };
    }

    api.setState('activeRowDefs', defsFor('active'));
    api.setState('offlineRowDefs', defsFor('offline'));
}
