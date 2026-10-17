function diffWithOverridden() {
    var selectedRow = g_list.getChecked() || "";
    var selectedIds = selectedRow.split(',').filter(Boolean);

    if (!selectedIds || selectedIds.length == 0) {
        g_form.addInfoMessage(getMessage('Select an override to compare with this record.'));
        return;
    }
    if (selectedIds.length > 1) {
        g_form.addInfoMessage(getMessage('Select only one override to compare with this record.'));
        return;
    }

    var selectedRecordId = selectedIds[0];
    var tableName = g_form.getValue('table_name');
    var baseRecordId = g_form.getUniqueValue();

    // Step 1: Get the sys id of overridden record (global/base version)
    getOverriddenRecordSysId(baseRecordId, function(overriddenSysId) {
        if (!overriddenSysId) {
            gs.error('Unable to fetch overridden record sys id.');
            return;
        }

        // Step 2: Now get selected override sys id (domain specific version)
        getOverrideRecordSysId(selectedRecordId, function(overrideSysId) {
            if (!overrideSysId) {
                gs.error('Unable to fetch override record sys id.');
                return;
            }

            // Step 3: Show diff
            showDiffDialog(tableName, overriddenSysId, overrideSysId);
        });
    });
}

/**
 * Fetches the overridden record's sys_id (global version) via GlideAjax.
 *
 * @param {string} sysId - sys_id of the record in 'upgraded_overridden_process'.
 * @param {function} callback - Callback that receives the global record's sys_id.
 */
function getOverriddenRecordSysId(baseRecordId, callback) {
    var ga = new GlideAjax('DomainUpgradedProcessAjax');
    ga.addParam('sysparm_name', 'getOverriddenRecordGuid');
    ga.addParam('sysparm_sys_id', baseRecordId);
    ga.getXMLAnswer(function(response) {
        callback(response || null);
    });
}

/**
 * Fetches the override record's sys_id (domain-specific version) via GlideAjax.
 *
 * @param {string} selectedRecordId - sys_id of the selected override record.
 * @param {function} callback - Callback that receives the override record's sys_id.
 */
function getOverrideRecordSysId(selectedRecordId, callback) {
    var ga = new GlideAjax('DomainUpgradedProcessAjax');
    ga.addParam('sysparm_name', 'getOverrideRecordGuid');
    ga.addParam('sysparm_sys_id', selectedRecordId);
    ga.getXMLAnswer(function(response) {
        callback(response || null);
    });
}

/**
 * Displays a diff comparison dialog between two records.
 *
 * @param {string} tableName - The name of the table containing the records.
 * @param {string} id1 - sys_id of the first record (usually the global/base record).
 * @param {string} id2 - sys_id of the second record (usually the override/domain-specific record).
 */
function showDiffDialog(tableName, id1, id2) {
    var ga = new GlideAjax('DomainUpgradedProcessAjax');
    ga.addParam('sysparm_name', 'diffTwoAny');
    ga.addParam('sysparm_table', tableName);
    ga.addParam('sysparm_id1', id1); // Overridden
    ga.addParam('sysparm_id2', id2); // Override
    ga.getXMLAnswer(function(html) {
        new GlideBox({
            body: html,
            title: getMessage('Compare to Global Version'),
            height: '95%',
            width: '95%',
            autoDimensionOnLoad: true
        }).render();
    });
}
