(function repointDefaultRetirementDefinition() {

    gs.info('CMDB Staleness Definition: start updating default retirement definition');

    var TABLE = 'cmdb_retirement_custom_definitions';
    var CI_CLASS = 'cmdb_ci';

    // The definition as shipped. Anything else means the instance has customised it.
    var OOB_DEFINITION = 'life_cycle_stage=End of Life^life_cycle_stage_status=Retired^EQ';

    // operational_status 6 = Retired (cmdb_ci), install_status 7 = Retired (cmdb.xml). Unlike
    // life_cycle_stage these are always populated, so retirement resolves on every instance.
    var NEW_DEFINITION = 'operational_status=6^install_status=7^EQ';

    // Restricted to a fresh instance: this script must never alter an existing customer's cmdb_ci
    // definition on upgrade. The CSDM life cycle migration check and the Data Manager policy check
    // are deferred to app-cmdb-ws, which owns the full conditional logic for existing instances.
    if (!pm.isZboot()) {
        gs.info('CMDB Staleness Definition: Skipping ' + CI_CLASS + ' - not a fresh instance');
        return;
    }

    var gr = new GlideRecord(TABLE);
    gr.addQuery('table', CI_CLASS);
    gr.setLimit(1);
    gr.query();

    if (!gr.next()) {
        gs.error('CMDB Staleness Definition: The default retirement definition for ' + CI_CLASS + ' is missing');
        return;
    }

    if (OOB_DEFINITION != gr.getValue('retirement_definition')) {
        gs.info('CMDB Staleness Definition: Skipping ' + CI_CLASS + ' - its retirement definition has been customized on this instance');
        return;
    }

    gr.setValue('retirement_definition', NEW_DEFINITION);

    // "Retirement definition validation" is a before-update rule that calls setAbortAction on a
    // malformed condition, so a rejected write returns null instead of throwing. Without this
    // check a bad condition would ship as a silent success.
    if (!gr.update())
        gs.error('CMDB Staleness Definition: Could not update the retirement definition for ' + CI_CLASS + ' to "' + NEW_DEFINITION + '"');
    else
        gs.info('CMDB Staleness Definition: Updated ' + CI_CLASS + ' to "' + NEW_DEFINITION + '"');
})();
