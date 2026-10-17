if (selection_result == "navigate") {
    var gr = new GlideRecord("mid_server_profile");
    gr.get(profile_id);
    response.sendRedirect(gr.getLink());
} else {
	var m2mTables = {
		"capability": {
			profileM2M: "mid_profile_capability_m2m",
			agentM2M: "ecc_agent_capability_m2m"
		},
		"application": {
			profileM2M: "mid_profile_application_m2m",
			agentM2M: "ecc_agent_application_m2m"
		},
		"cluster": {
			profileM2M: "mid_profile_cluster_m2m",
			agentM2M: "ecc_agent_cluster_member_m2m"
		},
		"ip_range": {
			profileM2M: "mid_profile_ip_range_m2m",
			agentM2M: "ecc_agent_ip_range_m2m"
		}
	};
    var kvTables = {
        "mid_profile_config": {
            fieldName: "param_name",
            sourceTable: "ecc_agent_config"
        },
        "mid_profile_property": {
            fieldName: "name",
            sourceTable: "ecc_agent_property"
        }
    };
	var profileGr = new GlideRecord('mid_server_profile');
	var midGr = new GlideRecord('ecc_agent');
	midGr.get(mid_record);
	profileGr.initialize();
	profileGr.name = "New profile created from MID server: " + midGr.name;
	profileGr.insert();
	gs.log("Creating new MID Server profile from MID server: " + midGr.name, "MIDServer");

	//copy all MID KV Settings (Properties, Configs)
	for (var table in kvTables) {
		_copyMidKVSettings(midGr.sys_id, profileGr, table, kvTables[table].fieldName, kvTables[table].sourceTable);
	}

	//retrieve all MID M2M Settings (Clusters, IP Ranges, Applications, Capabilities)
	var profileM2MSettings = _getMidM2MSettings(midGr.sys_id, m2mTables);
	//copy all M2M MID settings
	for (var m2mtable in m2mTables) {
		_copyMidM2MSettings(profileGr, m2mtable, profileM2MSettings[m2mtable], m2mTables[m2mtable].profileM2M);
	}

	gs.log("New MID Server profile succesfully created from MID server: " + midGr.name, "MIDServer");
	response.sendRedirect(profileGr.getLink());
}

function _getMidM2MSettings(agentId, tables) {
    var settings = {}; // key: table name, value: array of sys Ids for each setting on table
    // key is the field name of the corresponding table
    for (var fieldName in tables) {
        settings[fieldName] = [];
        var tableName = tables[fieldName].agentM2M;
        var gr = new GlideRecord(tableName);
        gr.query("agent", agentId);
        while (gr.next()) {
            var setting = gr.getValue(fieldName);
            settings[fieldName].push(setting);
        }
    }
    return settings;
}

function _copyMidM2MSettings(profile, settingName, settingsArr, profileTable) {
    var gr = new GlideRecord(profileTable);
    gr.addQuery("profile", profile);
    gr.query();
    for (var i = 0; i < settingsArr.length; i++) {
        gr.initialize();
        gr.setWorkflow(false);
        gr.setValue("profile", profile.sys_id);
        gr.setValue(settingName, settingsArr[i]);
        gr.insert();
    }
}

function _copyMidKVSettings(agentId, profile, table, fieldName, sourceTable) {
    var settings = {}; // key: table name, value: map of kv settings on table
    var gr = new GlideRecord(sourceTable);
    gr.query("ecc_agent", agentId);
    while (gr.next()) {
        var setting = gr.getValue(fieldName);
        var value = gr.getValue("value");
        if (sourceTable == "ecc_agent_config") {
            var sett = SncMIDConfigParameter.byName(setting);
            if (!sett.isHidden() && sett.isListed()) settings[setting] = value;
        } else {
            settings[setting] = value;
        }
    }

    var pgr = new GlideRecord(table);
    for (var newSetting in settings) {
        if (_isIgnoredParam(newSetting)) {
            gs.warn(gs.getMessage("Cannot sync parameter \"{0}\", skipping...", newSetting), "MID Server");
            continue;
        }
        if (newSetting == 'url') {
			pgr.setWorkflow(false);
			pgr.get("profile", profile.sys_id);
            pgr.get('name', 'url');
            pgr.setValue("value", settings[newSetting]);
            pgr.update();
        } else {
            pgr.initialize();
            pgr.setWorkflow(false);
            pgr.setValue("profile", profile.sys_id);
            pgr.setValue("name", newSetting);
            pgr.setValue("value", settings[newSetting]);
            pgr.insert();
        }
    }
}

function _isIgnoredParam(name) {
    var IGNORED_PARAMS = ["mid.buildstamp", "mid_sys_id", "keypairs.mid_id", "home_dir"];
    return IGNORED_PARAMS.indexOf(name) != -1;
}
