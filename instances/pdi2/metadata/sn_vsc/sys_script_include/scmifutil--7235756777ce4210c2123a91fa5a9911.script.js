var SCMIFUtil = Class.create();
SCMIFUtil.prototype = {
    initialize: function() {},
    getMIFSyncUpTime: function() {
        var times = sn_mif.MIFPublicAPI.getJobTimes();
        return times.sync_up_job_time;
    },
    setSCMIFJobRuntime: function() {
        var syncUpTime = this.getMIFSyncUpTime();
        if (gs.nil(syncUpTime)) {
            return;
        }
        var gdt = new GlideDateTime(syncUpTime);
        var gt = new GlideTime();
        gt.setValue('02:00:00'); // 2 hours before MIF sync up time
        gdt.subtract(gt);
        var gr = new GlideRecord('sysauto_script');
        if (gr.get('15cc6a2d770e0210c2123a91fa5a990f') && gr.run_type == 'on_demand') {
            gr.run_type = 'daily';
            gr.run_time = gdt.getTime();
            gr.update();

            // deactivate the runtime setup job
            var gr1 = new GlideRecord('sysauto_script');
            if (gr1.get('848bbe2b55c20210f877414e3a6bb89d')) {
                gr1.active = false;
                gr1.update();
            }
        }
    },
    captureSCMIData: function() {
        // execute the script only if there is a record with instance id in MIF instance table
        var instanceId = this.getInstanceId();
        if (gs.nil(instanceId)) {
            return;
        }

        // run SC PA jobs
        this.runSCPAJob('256e4ce5775a211004d63a91fa5a99a8');
        this.runSCPAJob('18178a2053b9011090d8ddeeff7b12f0');
        this.runSCPAJob('8b80ef56eb001110f32fed9c4252286a');

        this.setHardeningScoreDetails(instanceId);
        this.setAlertDetails(instanceId);
        this.setReleaseVersionDetails(instanceId);
        this.setUserDetails(instanceId);
        this.setLoginProtectionDetails(instanceId);
        this.setDataProtectionMetrics(instanceId);
    },
    runSCPAJob: function(paJobId) {
        var vsc_pa_job = new GlideRecord('sysauto_pa');
        if (vsc_pa_job.get(paJobId)) {
            gs.executeNow(vsc_pa_job);
        }
    },
    getInstanceId: function() {
        var instanceId = gs.getProperty('instance_id');
        if (!gs.nil(instanceId)) {
            var grMIF = new GlideRecord('sn_mif_instance');
            grMIF.addQuery('instance_id', instanceId);
            grMIF.query();
            if (grMIF.hasNext()) {
                return instanceId;
            }
        }
        return '';
    },

    setUserDetails: function(instanceId) {
        var prevActiveUsers = 0;
        var prevActiveIntegrationAcc = 0;
        var prevActivePrivilegedAcc = 0;
        var totalUsers = this.getPAScore('a3ea576ceb201110f32fed9c425228ac');
        var activeUsers = this.getPAScore('c4aedf0820445910f877de4b9ee9ccef');
        var activeIntegrationAcc = this.getPAScore('c3d0ecd820485910f877de4b9ee9cc26');
        var activePrivilegedAcc = this.getPAScore('f6476f276bb01110638c83eece44afec');
        var neverLoggedInUsers = this.getPAScore('6f068c1020085910f877de4b9ee9cc94');
        var recFound = false;

        var gr = new GlideRecord('sn_vsc_mi_user_metrics');
        gr.addQuery('instance_id', instanceId);
        gr.orderBy('sys_created_on');
        gr.query();
        if (gr.next()) {
            prevActiveUsers = gr.active_users;
            prevActiveIntegrationAcc = gr.active_integration_accounts;
            prevActivePrivilegedAcc = gr.active_privileged_accounts;
            recFound = true;
        } else {
            prevActiveUsers = activeUsers;
            prevActiveIntegrationAcc = activeIntegrationAcc;
            prevActivePrivilegedAcc = activePrivilegedAcc;
        }

        gr.total_users = totalUsers;
        gr.active_users = activeUsers;
        gr.active_integration_accounts = activeIntegrationAcc;
        gr.active_privileged_accounts = activePrivilegedAcc;
        gr.never_logged_in_users = neverLoggedInUsers;
        gr.prev_active_users = prevActiveUsers;
        gr.prev_active_integration_accounts = prevActiveIntegrationAcc;
        gr.prev_active_privileged_accounts = prevActivePrivilegedAcc;

        recFound ? gr.update() : gr.insert();
    },

    setDataProtectionMetrics: function(instanceId) {
        var prevTableColumns = 0;
        var prevClassifiedDataExports = 0;
        var prevClassifieldFields = 0;
        var prevEncryptedFields = 0;
        var tableCols = this.getPAScore('9ae8ab54435102102f66d069a7b8f283');
        var classifiedDataExp = this.getPAScore('374544c9074b91102fe9f1e08c1ed03a');
        var classfiedFields = this.getPAScore('24e7e714435102102f66d069a7b8f2a2');
        var encryptedFields = 0;
        var recFound = false;
        if (new GlidePluginManager().isActive('com.glide.encryption')) {
            encryptedFields = this.getPAScore('0d1aecad77f50210c2123a91fa5a99ab');
        }

        var gr = new GlideRecord('sn_vsc_mi_data_protection_metrics');
        gr.addQuery('instance_id', instanceId);
        gr.orderByDesc('sys_created_on');
        gr.query();

        // get prev score;
        if (gr.next()) {
            prevTableColumns = gr.total_table_columns;
            prevClassifiedDataExports = gr.classified_data_exports;
            prevClassifieldFields = gr.classified_fields;
            prevEncryptedFields = gr.encrypted_pii_classified_columns;
            recFound = true;
        } else {
            prevTableColumns = tableCols;
            prevClassifiedDataExports = classifiedDataExp;
            prevClassifieldFields = classfiedFields;
            prevEncryptedFields = encryptedFields;
        }

        gr.total_table_columns = tableCols;
        gr.classified_data_exports = classifiedDataExp;
        gr.classified_fields = classfiedFields;
        gr.encrypted_pii_classified_columns = encryptedFields;
        gr.prev_total_table_columns = prevTableColumns;
        gr.prev_classified_data_exports = prevClassifiedDataExports;
        gr.prev_classified_fields = prevClassifieldFields;
        gr.prev_encrypted_pii_classified_columns = prevEncryptedFields;
        recFound ? gr.update() : gr.insert();
    },

    setLoginProtectionDetails: function(instanceId) {
        var prevSSOWithoutReqSigning = 0;
        var prevSSOWithoutSAMLSigning = 0;
        var prevRestAPIsWithoutAccessPolicy = 0;
        var prevFailedLogins = 0;
        var prevFailedPrivilegedLogins = 0;
        var prevFailedPrivLoginsWithoutMFA = 0;
        var failedLogins = this.getPAScore('7646e1fbeb011110f32fed9c425228eb');
        var failedPrivLogins = this.getPAScore('54a8e97feb011110f32fed9c425228b4');
        var privLoginsWithoutMFA = this.getPAScore('dfa0d7c977f10210c2123a91fa5a9947');
        var ssoWithoutSAMLSigning = 0;
        var ssoWithoutReqSigning = 0;
        var restWithoutAccessPolicy = 0;
        var recFound = false;
        if (new GlidePluginManager().isActive('com.snc.integration.sso.multi')) {
            ssoWithoutSAMLSigning = this.getPAScore('693ce30ff16d8210f87774aaf6f084cd');
            ssoWithoutReqSigning = this.getPAScore('c984dcd7f1ad8210f87774aaf6f0847e');
        }

        if (new GlidePluginManager().isActive('com.glide.rest.policy')) {
            restWithoutAccessPolicy = this.getPAScore('96cb944777b12110c6213a91fa5a998e');
        }
        // get prev score;
        var gr = new GlideRecord('sn_vsc_mi_login_protection_metrics');
        gr.addQuery('instance_id', instanceId);
        gr.orderByDesc('sys_created_on');
        gr.query();
        if (gr.next()) {
            prevFailedLogins = gr.failed_logins;
            prevFailedPrivilegedLogins = gr.failed_privileged_logins;
            prevFailedPrivLoginsWithoutMFA = gr.privileged_logins_wo_mfa;
            prevSSOWithoutSAMLSigning = gr.sso_wo_saml_signing;
            prevSSOWithoutReqSigning = gr.sso_wo_encryption_signing;
            prevRestAPIsWithoutAccessPolicy = gr.rest_apis_wo_api_access_policy;
            recFound = true;
        } else {
            prevFailedLogins = failedLogins;
            prevFailedPrivilegedLogins = failedPrivLogins;
            prevFailedPrivLoginsWithoutMFA = privLoginsWithoutMFA;
            prevSSOWithoutSAMLSigning = ssoWithoutSAMLSigning;
            prevSSOWithoutReqSigning = ssoWithoutReqSigning;
            prevRestAPIsWithoutAccessPolicy = restWithoutAccessPolicy;
        }

        gr.failed_logins = failedLogins;
        gr.failed_privileged_logins = failedPrivLogins;
        gr.privileged_logins_wo_mfa = privLoginsWithoutMFA;
        gr.sso_wo_saml_signing = ssoWithoutSAMLSigning;
        gr.sso_wo_encryption_signing = ssoWithoutReqSigning;
        gr.rest_apis_wo_api_access_policy = restWithoutAccessPolicy;
        gr.prev_failed_logins = prevFailedLogins;
        gr.prev_failed_privileged_logins = prevFailedPrivilegedLogins;
        gr.prev_privileged_logins_wo_mfa = prevFailedPrivLoginsWithoutMFA;
        gr.prev_wo_saml_signing = prevSSOWithoutSAMLSigning;
        gr.prev_sso_wo_encryption_signing = prevSSOWithoutReqSigning;
        gr.prev_rest_apis_wo_api_access_policy = prevRestAPIsWithoutAccessPolicy;
        recFound ? gr.update() : gr.insert();

    },

    setReleaseVersionDetails: function(instanceId) {
        var recFound = false;
        var gr = new GlideRecord('sn_vsc_mi_upgrade_versions');
        gr.addQuery('instance_id', instanceId);
        gr.query();
        if (gr.next()) {
            recFound = true;
        }
        var glideWarProp = gs.getProperty('glide.war');
        var buildTagProp = gs.getProperty('glide.buildtag');
        if (glideWarProp != null && buildTagProp != null) {
            var grUpgradeHistory = new GlideRecord('sys_upgrade_history');
            grUpgradeHistory.addQuery('upgrade_finishedISNOTEMPTY');
            grUpgradeHistory.addQuery('to_version', gs.getProperty('glide.war'));
            grUpgradeHistory.orderByDesc('upgrade_finished');
            grUpgradeHistory.setLimit(1);
            grUpgradeHistory.query();
            if (grUpgradeHistory.next()) {
                gr.last_version_updated = new GlideDateTime(grUpgradeHistory.upgrade_finished).getDate();
            }

            var buildTag = buildTagProp.split('__');
            var familyVersion = buildTag[0].split('-')[1];

            if (buildTag.length > 1) {
                var patchVersion = buildTag[1].split('-');
                familyVersion = familyVersion + ' ' + patchVersion[0];
                if (patchVersion.length > 4) // > 4 will have hotfix detail
                {
                    familyVersion = familyVersion + ' ' + patchVersion[1];
                }
            }
            gr.family = familyVersion;
            recFound ? gr.update() : gr.insert();
        }
    },

    setAlertDetails: function(instanceId) {
        var recFound = false;
        var gr = new GlideRecord('sn_vsc_mi_alert_metrics');
        gr.addQuery('instance_id', instanceId);
        gr.query();
        if (gr.next()) {
            recFound = true;
        }

        var quarantineFilesIndicatorId = '1c7d3b0434db9110f877339ba5f48bee';

        // number of customer actions due soon 
        var grCU = new GlideRecord('sn_critical_update');
        grCU.addQuery('up_update_priority', 'due_soon');
        grCU.query();

        gr.ca_due_soon = grCU.getRowCount();
        gr.malware_infections_last_day = this.getPAScore(quarantineFilesIndicatorId);

        var grThreshold = new GlideRecord('sn_vsc_metric_threshold_event');
        grThreshold.addEncodedQuery('sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()');
        grThreshold.query();
        var thresholdCount = grThreshold.hasNext() ? grThreshold.getRowCount() : 0;
        gr.threshold_alerts_last_day = thresholdCount;

        recFound ? gr.update() : gr.insert();
    },

    setHardeningScoreDetails: function(instanceId) {
        var prevScore = 0;
        var currScore = 0;
        var currGDT, prevGDT;
        var updatedSettings = 0;
        var n = 0;
        var gr = new GlideRecord('sn_vsc_hardening_compliance_scores');
        gr.orderByDesc('harc_collected');
        gr.query();
        while (gr.next()) {
            if (n == 0) {
                currScore = parseInt(gr.getValue('harc_score'));
                currGDT = new GlideDateTime(gr.getValue("harc_collected"));
            } else {
                var prevHarcDate = new GlideDateTime(gr.getValue("harc_collected"));
                if (prevHarcDate.getDate() != currGDT.getDate()) {
                    prevScore = parseInt(gr.getValue('harc_score'));
                    prevGDT = prevHarcDate;
                    break;
                }
            }
            n++;
        }

        if (prevScore == 0) {
            prevScore = currScore;
            prevGDT = currGDT;
        }

        // get updated settings 
        var scUtil = new sn_vsc.SCComparisonUtil();
        if (currGDT.getDate() != prevGDT.getDate()) {
            var grSettings = scUtil.getUpdatedSettingsBetweenTimes(currGDT, prevGDT);
            if (grSettings) {
                updatedSettings = grSettings.getRowCount();
            }
        }

        // clear table
        var miHarc = new GlideRecord('sn_vsc_mi_hardening_score');
        miHarc.addQuery('instance_id', instanceId);
        miHarc.query();
        var recFound = miHarc.next();

        // insert new record
        miHarc.last_updated = currGDT;
        miHarc.score = currScore;
        miHarc.prev_score = prevScore;
        miHarc.score_change = Math.abs(currScore - prevScore);
        miHarc.changed_settings = updatedSettings;
        recFound ? miHarc.update() : miHarc.insert();
    },

    getPAScore: function(indicatorId) {
        var sc = new global.PAScorecard();
        sc.addParam('uuid', indicatorId);
        var result = sc.query();
        return (result.length > 0) ? result[0].value : 0;
    },

    getSIWidgetNavParams: function() {
        var pageParams = {
            // hardening score trend
            'c725162518678110f877e53e0f01871f': {
                "route": "score_trend"
            },
            // antivirus downloaded files (or) quarantined files
            "1c7d3b0434db9110f877339ba5f48bee": {
                "route": 'sec_center_kpi_details',
                "fields": {
                    "indicatorId": "1c7d3b0434db9110f877339ba5f48bee"
                }
            },
            "90d74c68776a0210c2123a91fa5a9959": {
                "route": "security_scan_results"
            },
            //total users
            "a3ea576ceb201110f32fed9c425228ac": {
                "route": "identity-center-details",
                "fields": {
                    'indicatorId': 'a3ea576ceb201110f32fed9c425228ac',
                    'listTable': "sys_user",
                    'listTitle': "Total users",
                    'listSort': "ORDERBYDESCsys_created_on",
                    'listFilter': "''",
                    'listColumns': "user_name,name,email,active,sys_created_on,sys_updated_on"
                }
            },
            //active users 
            "c4aedf0820445910f877de4b9ee9ccef": {
                "route": "identity-center-details",
                "fields": {
                    "indicatorId": "c4aedf0820445910f877de4b9ee9ccef",
                    "listTable": "sys_user",
                    "listTitle": "Active users",
                    "listFilter": "active%3Dtrue",
                    "listSort": "ORDERBYDESCname",
                    "listColumns": "user_name,name,email,active,sys_created_on,sys_updated_on"
                }
            },
            // active privileged users
            "f6476f276bb01110638c83eece44afec": {
                "route": "identity-center-details",
                "fields": {
                    'indicatorId': 'f6476f276bb01110638c83eece44afec',
                    'listTable': "sn_vsc_icenter_privileged_users_details",
                    'listTitle': "Active privileged users",
                    'listFilter': "usr_active%3Dtrue",
                    'listSort': "ORDERBYDESCusr_name",
                    'listColumns': "usr_user_name,usr_name,userrole_role,usr_email,usr_active,usr_sys_created_on,usr_sys_updated_on"
                }
            },
            // active integration accounts
            "c3d0ecd820485910f877de4b9ee9cc26": {
                "route": "identity-center-details",
                "fields": {
                    "indicatorId": 'c3d0ecd820485910f877de4b9ee9cc26',
                    "listTable": "sys_user",
                    "listTitle": "Active integration accounts",
                    "listFilter": "internal_integration_user%3Dfalse%5EORinternal_integration_userISEMPTY%5Eweb_service_access_only%3Dtrue%5Eactive%3Dtrue",
                    "listSort": "ORDERBYDESCsys_created_on",
                    "listColumns": "user_name,name,email,active,sys_created_on,sys_updated_on"
                }
            },
            // users never logged in
            "6f068c1020085910f877de4b9ee9cc94": {
                "route": "identity-center-details",
                "fields": {
                    "indicatorId": '6f068c1020085910f877de4b9ee9cc94',
                    "listTable": "sys_user",
                    "listTitle": "Users never logged in",
                    "listFilter": "last_login_timeISEMPTY%5Esys_created_on%3Cjavascript%3Ags.beginningOfLast30Days()%5Eactive%3Dtrue",
                    "listSort": "ORDERBYDESCsys_created_on",
                    "listColumns": "user_name,name,email,active,sys_created_on,sys_updated_on"
                }
            },

            //rest api without api access policy
            "96cb944777b12110c6213a91fa5a998e": {
                "route": "sc_kp_details",
                "fields": {
                    "indicatorId": "96cb944777b12110c6213a91fa5a998e",
                    "listTable": "sc_rest_api_without_access_policy",
                    "listTitle": "REST APIs Without Access Policy",
                    "listSort": "ORDERBYDESCsys_created_on",
                    "listColumns": "api_name,api_path"
                }
            },
            // classified data exports
            "374544c9074b91102fe9f1e08c1ed03a": {
                "route": "sec_center_kpi_details",
                "fields": {
                    "indicatorId": "374544c9074b91102fe9f1e08c1ed03a"
                }
            },
            // failed logins
            "7646e1fbeb011110f32fed9c425228eb": {
                "route": "identity-center-details",
                "fields": {
                    "indicatorId": "7646e1fbeb011110f32fed9c425228eb",
                    "listTable": "sys_user_login_history",
                    "listTitle": "Failed logins",
                    "listFilter": encodeURIComponent('login_status=FAILURE'),
                    "listSort": "ORDERBYDESClogin_time",
                    "listColumns": "user.user_name,user.name,login_client,login_time,authentication_method_used,login_failure_reason,privileged_user"
                }
            },
            // Privileged logins without MFA
            "dfa0d7c977f10210c2123a91fa5a9947": {
                "route": "identity-center-details",
                "fields": {
                    "indicatorId": "dfa0d7c977f10210c2123a91fa5a9947",
                    "listTable": "sys_user_login_history",
                    "listTitle": "Privileged logins without MFA",
                    "listFilter": encodeURIComponent('login_timeONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()^authentication_method_used=DB^login_status=SUCCESS^mfa_enforced=false^privileged_user=true'),
                    "listSort": "ORDERBYDESClogin_time",
                    "listColumns": "user.user_name,user.name,login_client,login_time,authentication_method_used"
                }
            },
            // Failed privilege user logins
            "54a8e97feb011110f32fed9c425228b4": {
                "route": "identity-center-details",
                "fields": {
                    "indicatorId": "54a8e97feb011110f32fed9c425228b4",
                    "listTable": "sys_user_login_history",
                    "listTitle": "Failed privilege user logins",
                    "listFilter": encodeURIComponent('login_timeONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()^login_status=FAILURE^privileged_user=true'),
                    "listSort": "ORDERBYDESClogin_time",
                    "listColumns": "user.user_name,user.name,login_client,login_time,authentication_method_used"
                }
            },
            // total number of table columns
            "9ae8ab54435102102f66d069a7b8f283": {
                "route": "sc_kp_details",
                "fields": {
                    "indicatorId": "9ae8ab54435102102f66d069a7b8f283",
                    "listTable": "sys_dictionary",
                    "listTitle": "Classifiable data",
                    "listSort": "ORDERBYDESCsys_created_on",
                    "listColumns": "name,element,internal_type,sys_created_on"
                }
            },
            // SC PII Encrypted Fields
            "0d1aecad77f50210c2123a91fa5a99ab": {
                "route": "sec_center_kpi_details",
                "fields": {
                    "indicatorId": "0d1aecad77f50210c2123a91fa5a99ab"
                }
            },
            // SC PII classified fields
            "34c57b5177750210c2123a91fa5a9995": {
                "route": "sec_center_kpi_details",
                "fields": {
                    "indicatorId": "34c57b5177750210c2123a91fa5a9995"
                }
            },
            //SSO without SAML request signing
            "693ce30ff16d8210f87774aaf6f084cd": {
                "route": "sec_center_kpi_details",
                "fields": {
                    "indicatorId": "693ce30ff16d8210f87774aaf6f084cd"
                }
            },
            // SSO without encrypted assertion
            "c984dcd7f1ad8210f87774aaf6f0847e": {
                "route": "sec_center_kpi_details",
                "fields": {
                    "indicatorId": "c984dcd7f1ad8210f87774aaf6f0847e"
                }
            }
        };
        return pageParams;
    },
    type: 'SCMIFUtil'
};
