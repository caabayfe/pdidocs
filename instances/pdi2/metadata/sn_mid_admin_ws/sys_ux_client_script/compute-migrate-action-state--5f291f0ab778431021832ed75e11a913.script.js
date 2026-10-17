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
        var selectedRaw = api.state.selectedMidsForMigration;
        var selected;
        if (Array.isArray(selectedRaw)) {
            // Array form: either array of strings or array of row objects                                                       
            selected = selectedRaw.map(function(item) {
                return typeof item === 'string' ? item : (item && item.key);
            }).filter(function(id) {
                return !!id;
            });
        } else if (selectedRaw && typeof selectedRaw === 'object') {
            // Map form: keys ARE the row keys (sys_ids)                                                                         
            selected = Object.keys(selectedRaw);
        } else {
            selected = [];
        }

        var rows = (api.data['get_ipki_migration_list_rows'] &&
            api.data['get_ipki_migration_list_rows'].output &&
            api.data['get_ipki_migration_list_rows'].output.rows) || [];
        var summary = (api.data['get_ipki_migration_list_rows'] &&
            api.data['get_ipki_migration_list_rows'].output &&
            api.data['get_ipki_migration_list_rows'].output.summary) || {};
        var hasActiveIpki = !!summary.hasActiveIpki;

        // Build the set of migratable MID sys_ids (validated, up, status not_started or failed)
        var migratableIds = {};
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            if ((r.status.value === 'not_started' || r.status.value === 'failed') &&
                r.midStatus === 'Up' &&
                r.midValidated) {
                migratableIds[r.midSysId] = true;
            }
        }

        // Defensively strip any IDs that aren't migratable (stale selection / shape drift)                                      
        var safeSelected = selected.filter(function(id) {
            return migratableIds[id];
        });
        var selectedCount = safeSelected.length;
        api.setState('midSysIdsForMigration', safeSelected);

        // Disable rules:                                                                                                        
        //   1) 0 selected -> disabled (must pick at least one)
        //   2) 2+ selected but no MID active on iPKI yet -> disabled (block bulk-first migration)
        var disabled = (selectedCount === 0) || (selectedCount > 1 && !hasActiveIpki);
        api.setState('migrateButtonDisabled', disabled);

        var t = await Promise.all([
                    helpers.translate('mid_setup_migration_modal_title_single', 'Migrate MID Server'),
                    helpers.translate('mid_setup_migration_modal_primary_single', 'This will migrate 1 selected MID Server to certificate-based authentication.'),                                                                                              
                        helpers.translate('mid_setup_migration_modal_confirm_single', 'Migrate server'),
                        helpers.translate('mid_setup_migration_modal_title_multi', 'Migrate selected MID Servers'),
                        helpers.translate('mid_setup_migration_modal_primary_multi', 'This will migrate {count} selected MID Servers to certificate-based authentication.'),                                                                                              
                            helpers.translate('mid_setup_migration_modal_confirm_multi', 'Migrate {count} servers'),
                            helpers.translate('mid_setup_migration_modal_confirm_default', 'Migrate')
                        ]);

                    var titleSingle = t[0],
                        primarySingle = t[1],
                        confirmSingle = t[2];
                    var titleMulti = t[3],
                        primaryMulti = t[4],
                        confirmMulti = t[5];
                    var confirmDefault = t[6];

                    var title, primary, confirmLabel;
                    if (selectedCount === 1) {
                        title = titleSingle;
                        primary = primarySingle;
                        confirmLabel = confirmSingle;
                    } else {
                        title = titleMulti;
                        primary = primaryMulti.replace('{count}', selectedCount);
                        confirmLabel = selectedCount === 0 ?
                            confirmDefault :
                            confirmMulti.replace('{count}', selectedCount);
                    }

                    api.setState('migrateModalText', {
                        title: title,
                        primary: primary,
                        note: '',
                        confirmLabel: confirmLabel
                    });
                }
