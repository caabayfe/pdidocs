
    function xmlVal(payload, field) {
        if (!payload) return '';
        var tag = '<' + field;
        var i = payload.indexOf(tag);
        if (i < 0) return '';
        i = payload.indexOf('>', i + tag.length);
        if (i < 0) return '';
        i++;
        var j = payload.indexOf('</' + field + '>', i);
        return j < 0 ? '' : payload.substring(i, j);
    }

    var idAppliesTo = {};
    function lookupAppliesTo(idSysId) {
        if (idAppliesTo[idSysId]) return idAppliesTo[idSysId];
        var val = '';
        var gr = new GlideRecord('cmdb_identifier');
        if (gr.get(idSysId))
            val = gr.getValue('applies_to');
        if (!val) {
            var ad = new GlideRecord('sys_audit_delete');
            ad.addQuery('tablename', 'cmdb_identifier');
            ad.addQuery('documentkey', idSysId);
            ad.setLimit(1);
            ad.query();
            if (ad.next())
                val = xmlVal(ad.getValue('payload'), 'applies_to');
        }
        if (!val) {
            var vr = new GlideRecord('sys_update_version');
            vr.addQuery('name', 'cmdb_identifier_' + idSysId);
            vr.setLimit(1);
            vr.query();
            if (vr.next())
                val = xmlVal(vr.getValue('payload'), 'applies_to');
        }
        if (val) idAppliesTo[idSysId] = val;
        return val || '';
    }

    var hwSet = {};
    var hwList = GlideDBObjectManager.get().getAllExtensions('cmdb_ci_hardware');
    for (var i = 0; i < hwList.size(); i++)
        hwSet[hwList.get(i).toString()] = true;
    var hwCsv = Object.keys(hwSet).join(',');

    var ga3 = new GlideAggregate('cmdb_ie_active_config');
    ga3.addQuery('applies_to', 'IN', hwCsv);
    ga3.addAggregate('COUNT');
    ga3.query();
    ga3.next();
    var hwAcTotal = parseInt(ga3.getAggregate('COUNT'));

    var hwIdTouched = {};
    var hwEntTouched = {};
    var atfTestIdentifier = '';
    var uv = new GlideRecord('sys_update_version');
    uv.addQuery('name', 'STARTSWITH', 'cmdb_identifier_');
    uv.addQuery('source_table', 'sys_update_set');
    uv.orderBy('name');
    uv.query();
    while (uv.next()) {
        var name = uv.getValue('name');
        var action = uv.getValue('action');
        var payload = uv.getValue('payload');
        var isEntry = name.indexOf('cmdb_identifier_entry_') === 0;

        var appliesTo;
        if (isEntry) {
            if(xmlVal(payload, 'identifier') == atfTestIdentifier)
                continue;

            var esid = name.substring('cmdb_identifier_entry_'.length);
            var idRef = xmlVal(payload, 'identifier');
            appliesTo = idRef ? lookupAppliesTo(idRef) : '';
            if (hwSet[appliesTo])
                hwEntTouched[esid] = true;
        } else {
            if(xmlVal(payload, 'applies_to') == 'cmdb_ci_acc' &&
                xmlVal(payload, 'description') == 'Identification rule for Accessory' &&
                xmlVal(payload, 'name') == 'Accessory rule') {
                atfTestIdentifier = xmlVal(payload, 'sys_id');
                continue;
            }

            var sid = name.substring('cmdb_identifier_'.length);
            appliesTo = xmlVal(payload, 'applies_to');
            if (appliesTo) idAppliesTo[sid] = appliesTo;  // seed cache from payload
            if (hwSet[appliesTo])
                hwIdTouched[sid] = true;
        }
    }

	if(!Object.keys(hwEntTouched).length && !Object.keys(hwIdTouched).length && !hwAcTotal) {
		gs.setProperty('glide.identification_engine.dynamic_ire.auto_compare', 'false');
		var d = new GlideRecord('sys_ire_pattern');
		d.addQuery('label','STARTSWITH', 'IdentificationEngineComparison');
		d.deleteMultiple();

		new GlideRecord('cmdb_ire_output_comparison_item').deleteMultiple();
		new GlideRecord('cmdb_ire_output_comparison').deleteMultiple();
		gs.setProperty('glide.identification_engine.dynamic_ire_enabled', 'true');
		
	}
