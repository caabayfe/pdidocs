var CloudDiscoveryScheduleConfig = Class.create();
CloudDiscoveryScheduleConfig.prototype = {


    //Initializing script includes, used in this script include, globally
    CLOUD_DISCOVERY_UTIL: new CloudResourceDiscoveryUtil(),
    CLOUD_WIZARD_DISCOVERY: new CloudWizardDiscovery(),

    initialize: function() {
        this.SCHEDULE_NAME_DUPLICATION_ERR_MSG = gs.getMessage('Schedule name already exists. Provide different schedule name.');
        this.VALID_GCP_PULL_EVENT_ITOM_PATTERN_VERSION = this.CLOUD_DISCOVERY_UTIL.checkSupportedPluginVersionInstalled(this.CLOUD_DISCOVERY_UTIL.ITOM_PATTERN_PLUGIN_NAME, this.CLOUD_DISCOVERY_UTIL.GCP_PULL_EVENT_SUPPORT_ITOM_PATTERN_VERSION);
        //Service Account Mapping Table Name -> service_account_options , field name -> 'shouldPullEvents'
        this.DB_FIELD_NAME_SHOULD_PULL_EVENTS = 'shouldPullEvents';
        this.CLOUD_SERVICE_ACCOUNT_FORM_FIELDS_METADATA = this.CLOUD_DISCOVERY_UTIL.getCloudServiceAccountFormFieldsMetadata();
    },

    midSelectionTypeHelpText: {
        "auto_select": gs.getMessage('Allow Discovery to select the MID Server automatically based on the Discovery IP Ranges you configure'),
        "specific_cluster": gs.getMessage('Use a preconfigured cluster of MID Servers.'),
        "specific_mid": gs.getMessage('Use only one MID Server')
    },

    /**
    * API fetches service accounts created for the given provider
    *
    * @datacenterClass – Provider class for which the service account details has to be fetched eg:- cmdb_ci_aws_datacenter
    *
    * [{
    	"sysId": "",
    	"name": "",
    	"accountId": "",
    	"discoveryCredentials": "",
    	"datacenterURL": "",
    	"datacenterClass": "",
    	"isMasterAccount": false,
    	"parentAccount": ""
    * }]
    *
    */
    getServiceAccountsByDatacenterType: function(datacenterClass) {
        var resultForServiceAccounts = {};
        var ldcServiceAccounts = [];
        var serviceAccounts = [];
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        serviceAccountGR.addQuery('datacenter_type', datacenterClass);
        serviceAccountGR.addQuery('install_status', '!=', '7');
        serviceAccountGR.query();

        // To improve the performance Getting service account sysId whose datacenter is already discovered
        var ldcGR = new GlideRecord("cmdb_rel_ci");
        ldcGR.addQuery('type', this.CLOUD_DISCOVERY_UTIL.getRelTypeId('Hosted on::Hosts'));
        ldcGR.addQuery('parent.sys_class_name', datacenterClass);
        ldcGR.query();

        while (ldcGR.next())
            ldcServiceAccounts.push(ldcGR.getValue('child'));

        if (serviceAccountGR.getRowCount() > 0) {
            var allServiceAccountsSysIDs = [];
            while (serviceAccountGR.next()) {
                var currentAccountSysID = serviceAccountGR.getUniqueValue() + '';
                var serviceAccount = this.getServiceAccountDetailsFromGR(serviceAccountGR);

                // Hide the non master cloud service account whose "exclude_from_discovery" flag is true
                if (!serviceAccount.isMasterAccount && serviceAccount.excludeFromDiscovery)
                    continue;
                // If the datacenter is already discovered or not
                serviceAccount['isDatacentersDiscovered'] = (ldcServiceAccounts.indexOf(currentAccountSysID) != -1);
                serviceAccounts.push(serviceAccount);
                allServiceAccountsSysIDs.push(currentAccountSysID);
            }

            // Get the access role information as well for the AWS specific Cloud Service Accounts to show in the CDU UI
            if (datacenterClass == 'cmdb_ci_aws_datacenter')
                this.getAccessRoleNameForServiceAccounts(serviceAccounts, allServiceAccountsSysIDs);
        } else
            resultForServiceAccounts.errorDetail = gs.getMessage('No cloud service account(s) found for the given datacenter type');

        resultForServiceAccounts.allServiceAccountsInfo = serviceAccounts;
        return resultForServiceAccounts;
    },

    getAccessRoleNameForServiceAccounts: function(serviceAccounts, allServiceAccountsSysIDs) {
        var accessRoleInfo = {};

        var accessRoleGR = new GlideRecord('cloud_service_account_aws_cross_assume_role_params');
        accessRoleGR.addQuery('cloud_service_account', 'IN', allServiceAccountsSysIDs);
        accessRoleGR.query();
        while (accessRoleGR.next())
            accessRoleInfo[accessRoleGR.getValue('cloud_service_account')] = accessRoleGR.getValue('access_role_name');

        serviceAccounts.forEach(function(serviceAccountInfo) {
            if (accessRoleInfo[serviceAccountInfo.sysId])
                serviceAccountInfo['accessRoleName'] = accessRoleInfo[serviceAccountInfo.sysId];
        });
    },

    getMemberServiceAccounts: function(masterAccount, discoverMemberAccounts, midServer) {
        var resultForMemberServiceAccounts = {};
        var serviceAccounts = [];

        var masterAccGR = new GlideRecord('cmdb_ci_cloud_service_account');
        if (masterAccGR.get(masterAccount)) {
            var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
            serviceAccountGR.addQuery('install_status', '!=', '7'); // Retired/Deleted Service Accounts should not be included in the list
            serviceAccountGR.addQuery('exclude_from_discovery', false);
            if (masterAccGR.getValue('datacenter_type') == 'cmdb_ci_google_datacenter' && masterAccGR.getValue('organization_id')) {
                serviceAccountGR.addQuery('organization_id', masterAccGR.getValue('organization_id'));
                serviceAccountGR.addQuery('sys_id', '!=', masterAccount);
                serviceAccountGR.query();
            } else {
                serviceAccountGR.addQuery('parent_account', masterAccount);
                serviceAccountGR.query();
            }

            if (serviceAccountGR.getRowCount() > 0) {
                while (serviceAccountGR.next())
                    serviceAccounts.push(this.getServiceAccountDetailsFromGR(serviceAccountGR));
            } else {
                //If there are no member accounts present for given service account then discover them
                var discoverMembers = JSUtil.toBoolean(discoverMemberAccounts);
                if (discoverMembers) {
                    var discoveredMembers = this.getMemberAccountsForMasterViaPattern(masterAccGR.getUniqueValue() + '', midServer);
                    if (discoveredMembers.memberAccountDetails)
                        serviceAccounts = discoveredMembers.memberAccountDetails;
                }
            }

            if (serviceAccounts.length > 0) {
                var cloudAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
                cloudAccountGR.get(masterAccount);

                /* GCP is a special case for which discovery supports the related projects via 'organization_id' as of today and
                 * in the near future, Super-Sub Accounts hierarchy via Master-Member framework of Cloud Service Account.
                 *
                 * Below check is to update the master cloud service account's "is_master" flag if at all pattern misses adding that information in any case
                 */
                if (!cloudAccountGR.is_master_account && !(cloudAccountGR.getValue('organization_id') && (cloudAccountGR.getValue('datacenter_type') == 'cmdb_ci_google_datacenter'))) {
                    cloudAccountGR.is_master_account = true;
                    cloudAccountGR.update();
                }
            } else
                resultForMemberServiceAccounts.errorDetail = gs.getMessage('No member account(s) found for the given cloud service account');
        } else
            resultForMemberServiceAccounts.errorDetail = gs.getMessage('No cloud service account record found for the given sys id');

        resultForMemberServiceAccounts.memberAccounts = serviceAccounts;
        return resultForMemberServiceAccounts;
    },

    /**
    * API fetches all the datacenters for the given service account
    *
    * @serviceAccount – service account for which the associated datacenter details has to be fetched
    * @scheduleId - Discovery Schedule created for the service account. Find no. of datacenters selected for the specific schedule
    *
    * @Output - Marks selected field to true for the selected specific datacenters.
    * [{
    		"sysId": "",
    		"name": "",
    		"region": "",
    		"selected": true/false
    * }]
    *
    */
    getDatacentersForServiceAccount: function(serviceAccount, scheduleId) {
        var resultForDatacenters = {};
        var datacenters = [];

        var accountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        if (accountGR.get(serviceAccount)) {
            var ldcGR = new GlideRecord('cmdb_ci_logical_datacenter');
            this.CLOUD_DISCOVERY_UTIL.queryRelCIBasedOnChild(serviceAccount, 'Hosted on::Hosts', ldcGR);
            ldcGR.query();

            if (ldcGR.getRowCount() > 0) {
                while (ldcGR.next()) {
                    datacenters.push({
                        sysId: ldcGR.getValue('sys_id'),
                        objectId: ldcGR.getValue('object_id'),
                        name: ldcGR.getValue('name'),
                        region: ldcGR.getValue('region'),
                        selected: false
                    });
                }
            } else
                resultForDatacenters.errorDetail = 'No datacenter(s) found for the given service account';

            //Only if scheduleId exists, find the specific datacenters associated with the schedule and set the selected falg to true.
            //If all datacenters are selected, mark selected is true for all the datacenters.
            if (resultForDatacenters.datacentersList) {
                var ldcConfigGR = new GlideRecord('cmp_discovery_ldc_config');
                var scheduleGR = ldcConfigGR.addJoinQuery('discovery_schedule', 'discovery_schedule', 'sys_id');
                ldcConfigGR.addQuery('discovery_schedule', scheduleId);
                ldcConfigGR.addQuery('service_account', serviceAccount);
                ldcConfigGR.query();

                if (ldcConfigGR.getRowCount() > 0) {
                    while (ldcConfigGR.next()) {
                        var ldc = ldcConfigGR.getValue('ldc');
                        if (JSUtil.nil(ldc)) {
                            for (var i = 0; i < datacenters.length; i++)
                                datacenters[i].selected = true;
                        } else {
                            var matchedIndex = datacenters.map(function(e) {
                                return e.sysId;
                            }).indexOf(ldcConfigGR.getValue('ldc'));
                            if (matchedIndex != -1)
                                datacenters[matchedIndex].selected = true;
                        }
                    }
                }
            }
        } else
            resultForDatacenters.errorDetail = gs.getMessage('No cloud service account found for the given sys id');

        resultForDatacenters.datacentersList = datacenters;
        return resultForDatacenters;
    },

    /**
    * API fetches all the providers supported for discovery
    *
    * [{
    		"sysId": "",
    		"name": ""
    * }]
    */
    getDiscoveryProvidersList: function() {
        var resultForDiscoProviders = {};
        var providers = [];
        var discoveryProviderGR = new GlideRecord('discovery_cloud_provider');
        discoveryProviderGR.orderBy('provider');
        discoveryProviderGR.query();

        if (discoveryProviderGR.getRowCount() > 0) {
            while (discoveryProviderGR.next()) {
                this.showPullEventInServiceAccForm = false;
                var capiProviderGR = new GlideRecord('sn_capi_provider');
                if (capiProviderGR.get('name', discoveryProviderGR.getValue('provider'))) {
                    var providerInfoObj = {
                        sysId: capiProviderGR.getValue('sys_id'),
                        name: discoveryProviderGR.getValue('provider'),
                        datacenterClass: capiProviderGR.getValue('datacenter_class'),
                        credential: discoveryProviderGR.getValue('credential'),
                        active: capiProviderGR.getValue('active'),
                        fieldOptions: this.getServiceAccountFieldOptions(discoveryProviderGR.getValue('provider'), capiProviderGR.getValue('datacenter_class'))
                    };
                    if (this.showPullEventInServiceAccForm)
                        providerInfoObj.showPullEventInServiceAccForm = true;
                    providers.push(providerInfoObj);
                }
            }
        } else
            resultForDiscoProviders.errorDetail = gs.getMessage('No discovery provider(s) are found');

        resultForDiscoProviders.discoveryProviders = providers;
        return resultForDiscoProviders;
    },

    getServiceAccountFieldOptions: function(provider, datacenterClass) {
        var fieldOptionsJSON = [];
        var fieldOptionsGR = new GlideRecord("service_account_field_options");
        fieldOptionsGR.orderBy('display_order');
        fieldOptionsGR.query("provider_type.provider", provider);
        while (fieldOptionsGR.next()) {
            fieldOptionsObj = {
                Name: fieldOptionsGR.getValue('name'),
                DisplayOrder: fieldOptionsGR.getValue('display_order'),
                Label: gs.getMessage('{0}', fieldOptionsGR.getValue('label')),
                Mandatory: fieldOptionsGR.getValue('mandatory') == 1,
                FieldType: fieldOptionsGR.getValue('field_type'),
                helpText: (fieldOptionsGR.getValue('help_text')) ? gs.getMessage('{0}', fieldOptionsGR.getValue('help_text')) : '',
                readOnly: fieldOptionsGR.getValue('read_only') == 1
            };

            if (this.DB_FIELD_NAME_SHOULD_PULL_EVENTS == fieldOptionsGR.getValue('name') && this.showPullEvent(datacenterClass) || this.DB_FIELD_NAME_SHOULD_PULL_EVENTS != fieldOptionsGR.getValue('name'))
                fieldOptionsJSON.push(fieldOptionsObj);
        }

        return fieldOptionsJSON;
    },


    /**
    * API fetches all the active mids (up and validated) with their capabilities
    *
    * [{
    	"sysId": "",
    	"name": ""
    * }]
    */
    getAllActiveMids: function() {
        var resultForMids = {};
        var midServers = [];

        var midServerGR = new GlideRecord('ecc_agent');
        midServerGR.addQuery('status', 'up');
        midServerGR.addQuery('validated', 'true');
        midServerGR.query();

        if (midServerGR.getRowCount() > 0) {
            while (midServerGR.next()) {
                midServers.push({
                    sysId: midServerGR.getValue('sys_id'),
                    name: midServerGR.getValue('name')
                });
            }
        } else
            resultForMids.errorDetail = gs.getMessage('No active mid server(s) found');

        resultForMids.mids = midServers;
        return resultForMids;
    },

    /**
    * API fetches all the active mids (up and validated) based on the capability
    *
    * [{
    	"sysId": "",
    	"name": ""
    * }]
    */
    getActiveMidsByProvider: function(provider, filter) {
        var resultForMidsByProvider = {};
        var midServers = [];
        var filterProperty = {
            'AWS': 'aws',
            'Google': 'gcp',
            'Azure': 'azure'
        };
        var midServerGR = new GlideRecord('ecc_agent');
        midServerGR.addQuery('status', 'up');
        midServerGR.addQuery('validated', 'true');
        var capabilityGR = midServerGR.addJoinQuery('ecc_agent_capability_m2m', 'sys_id', 'agent');
        capabilityGR.addCondition('capability.capability', provider);
        capabilityGR.addOrCondition('capability.capability', 'ALL');
        capabilityGR.addOrCondition('capability.capability', 'Cloud Management');

        if (JSUtil.toBoolean(filter)) {
            var filterGR = midServerGR.addJoinQuery('ecc_agent_config', 'sys_id', 'ecc_agent');
            filterGR.addCondition('param_name', 'CONTAINS', filterProperty[provider]);
        }

        midServerGR.query();

        if (midServerGR.getRowCount() > 0) {
            while (midServerGR.next()) {
                midServers.push({
                    sysId: midServerGR.getValue('sys_id'),
                    name: midServerGR.getValue('name'),
                    validated: midServerGR.getDisplayValue('validated'),
                    status: midServerGR.getDisplayValue('status'),
                    hostName: midServerGR.getValue('host_name')
                });
            }
        } else
            resultForMidsByProvider.errorDetail = gs.getMessage('No active mid server(s) found for the given provider');

        resultForMidsByProvider.midsInfo = midServers;
        return resultForMidsByProvider;
    },

    /**
    * API fetches all mid server clusters and their MID servers status should be active and validated
    *
    * [{
    	"sysId": "",
    	"name": ""
    * }]
    */
    getMidServerClusters: function() {
        var resultForMidClusters = {};
        var midServerClusters = [];
        var activeMidServers = this.getAllActiveMids();
        var midSysId = [];
        if (activeMidServers.mids) {
            activeMidServers.mids.forEach(function(mid) {
                midSysId.push(mid.sysId);
            });
        }
        var clusterMap = {};
        var midServerClusterGR = new GlideRecord('ecc_agent_cluster_member_m2m');
        midServerClusterGR.addQuery('agent', 'IN', midSysId);
        midServerClusterGR.query();
        if (midServerClusterGR.getRowCount() > 0) {
            while (midServerClusterGR.next()) {
                var clusterId = midServerClusterGR.getValue('cluster');
                if (!clusterMap[clusterId]) {
                    midServerClusters.push({
                        sysId: clusterId,
                        name: midServerClusterGR.cluster.name
                    });
                    clusterMap[clusterId] = true;
                }
            }
        } else
            resultForMidClusters.errorDetail = gs.getMessage('No mid server cluster(s) found');
        resultForMidClusters.midClusters = midServerClusters;
        return resultForMidClusters;
    },

    getMidServerClustersForProvider: function(provider) {

        var midServers = this.getActiveMidsByProvider(provider, 'false');
        var midSysId = [];
        var clusterMap = {};
        if (midServers.midsInfo) {
            midServers.midsInfo.forEach(function(mid) {
                midSysId.push(mid.sysId);
            });
        }
        var resultForMidClusters = {};
        var midServerClusters = [];
        var midServerClusterGR = new GlideRecord('ecc_agent_cluster_member_m2m');
        midServerClusterGR.addQuery('agent', 'IN', midSysId);
        midServerClusterGR.query();
        if (midServerClusterGR.getRowCount() > 0) {
            while (midServerClusterGR.next()) {
                var clusterId = midServerClusterGR.getValue('cluster')
                if (!clusterMap[clusterId]) {
                    midServerClusters.push({
                        sysId: clusterId,
                        name: midServerClusterGR.cluster.name
                    });
                    clusterMap[clusterId] = true;
                }
            }
        } else
            resultForMidClusters.errorDetail = gs.getMessage('No mid server cluster(s) found');

        resultForMidClusters.midClusters = midServerClusters;
        return resultForMidClusters;
    },




    /**
    * API fetches the credentials based on the given provider
    *
    * @provider - provider from which the credentials has to be captured eg:- AWS/Azure/VMware
    *
    * [{
    	"sysId": "",
    	"name": ""
    * }]
    */
    getCredentialsByProvider: function(provider) {
        var resultForCredentials = {};
        var credentials = [];

        var discoveryProviderGR = new GlideRecord('discovery_cloud_provider');
        if (discoveryProviderGR.get('provider', provider)) {
            var credentialGR = new GlideRecord(discoveryProviderGR.credential);
            credentialGR.addQuery('active', true);
            credentialGR.query();
            if (credentialGR.getRowCount() > 0) {
                while (credentialGR.next()) {
                    credentials.push({
                        sysId: credentialGR.getUniqueValue(),
                        name: credentialGR.getValue('name')
                    });
                }
            } else
                resultForCredentials.errorDetail = gs.getMessage('No credential(s) found for the given provider');
        } else
            resultForCredentials.errorDetail = gs.getMessage('No cloud provider found with the given name');

        resultForCredentials.credentialsInfo = credentials;
        return resultForCredentials;
    },

    /**
     * API fetches the datacenter info based on the provided discovery status sys id and updates 'Datacenter discovery status'
     * field of the respective Cloud Service Account
     *
     * @statusSysId - Sys Id of the Discovery Status created for Discovery Datacenters
     * @accountSysId - Sys Id of the Cloud Service Account selected
     */
    getDiscoverDatacenterInfoByStatusId: function(statusSysId, accountSysId) {
        var datacenterInfo = {};
        var date = new GlideDateTime().getDisplayValue();
        var statusObj = this.CLOUD_WIZARD_DISCOVERY.getDiscoveryResult(statusSysId);
        var accountGR = this.CLOUD_DISCOVERY_UTIL.getServiceAccount(accountSysId + '');

        if ((statusObj.ci_list).length > 0) {
            accountGR.datacenter_discovery_status = gs.getMessage('{0}: Completed....Reload this form to see an updated datacenter list.', date);
            accountGR.comments = '';
            accountGR.update();

            datacenterInfo = this.getDatacentersForServiceAccount(accountSysId);
        } else {
            var statusError = '';
            if (statusObj.hasOwnProperty('state') && (statusObj.state).equals('error'))
                statusError = statusObj.state;
            if ((statusObj.hasOwnProperty('error')) || (statusError.length > 0)) {
                accountGR.datacenter_discovery_status = gs.getMessage('{0}: Error....', date);
                accountGR.comments = statusError.length > 0 ? statusObj.message : statusObj.error;
            }
            accountGR.update();

            datacenterInfo.statusResult = statusObj;
        }
        return datacenterInfo;
    },

    /**
     * API to get the data of the fields from CDU's test account input form,  whose data need not be validated with the cloud
     * provider but still required for cloud service account as the cloud resources discovery patterns require that data
     *
     * @serviceAccountInfo - Contains information regarding the cloud service account that was intended to insert/update
     *
     * RESULT: { 'form_field_url' : '/bin/conf/', 'form_field_bucket_name' : 'testBucket' }
     *
     * form_field_url, form_field_bucket_name - are some fields where customer can add to Cloud Service Account table so we take the
     * data of those fields whose name prefixes with "form_field_"
     */
    _getFormFieldsDataFromCDUFormData: function(serviceAccountInfo) {
        var formFieldData = {};
        if (this.CLOUD_SERVICE_ACCOUNT_FORM_FIELDS_METADATA instanceof Array)
            (this.CLOUD_SERVICE_ACCOUNT_FORM_FIELDS_METADATA).forEach(function(fieldName) {
                formFieldData[fieldName] = (serviceAccountInfo[fieldName]) ? serviceAccountInfo[fieldName] : '';
            });
        return formFieldData;
    },

    /**
     * API validates the account and returns Status Sys Id after triggering Pattern's API for AWS/Azure
     *
     * @serviceAccountInfo - Contains information regarding the cloud service account that was intended to insert/update
     *
     * UI provides one more attribute - "isTimeout", if it is TRUE means User requested for Test Account with some details but that operation timed-out
     * so upon retry he gets the account information instead of returning the error saying 'Account ID existing..', if pattern API is successful in the
     * mean time and account is persisted. If "isTimeout" is false means its either a new request or User has changed the current detail after
     * encountering the operation timed-out scenario which is an invalid/pending use case.
     *
     */
    initializeValidateAccount: function(serviceAccountInfo) {
        var accountGR;
        var serviceAccount = {};
        var accountUrl = serviceAccountInfo.hasOwnProperty('datacenterURL') ? serviceAccountInfo.datacenterURL : '';
        var accountName = serviceAccountInfo.hasOwnProperty('name') ? serviceAccountInfo.name : '';
        var accountId = serviceAccountInfo.hasOwnProperty('accountId') ? serviceAccountInfo.accountId : '';
        var accountClassType = serviceAccountInfo.hasOwnProperty('datacenterClass') ? serviceAccountInfo.datacenterClass : '';
        var accountCredentialSysId = serviceAccountInfo.hasOwnProperty('discoveryCredentials') ? serviceAccountInfo.discoveryCredentials : '';
        var parentAccount = serviceAccountInfo.hasOwnProperty('parentAccount') ? serviceAccountInfo.parentAccount : '';
        var midServer = serviceAccountInfo.hasOwnProperty('selectedMid') ? serviceAccountInfo.selectedMid.name : '';
        var accessorAccount = serviceAccountInfo.hasOwnProperty('accessorAccount') ? serviceAccountInfo.accessorAccount : '';
        var midCluster = serviceAccountInfo.hasOwnProperty('selectedCluster') ? serviceAccountInfo.selectedCluster.sysId : '';
        var flowType = 'CDU';


        //Find the selected mid server is presented in the credential-less discovery MID server list. Applicable this condition checks only for AWS provider.
        var selectedCredentialLessMID = false;
        if (midServer && accountClassType && accountClassType.equals('cmdb_ci_aws_datacenter')) {
            var credentialLessMidListbyProvider = this.getActiveMidsByProvider('AWS', true);
            if (credentialLessMidListbyProvider.midsInfo.length) {
                for (var i = 0; i < credentialLessMidListbyProvider.midsInfo.length; i++) {
                    if (credentialLessMidListbyProvider.midsInfo[i].name == midServer) {
                        selectedCredentialLessMID = true;
                        break;
                    }
                }

            }
        }

        /**
         * DEF0401832 - Scenario: AWS Service Acc: When configuring a service account with an accessor account, populating the discovery credential field with accessor account credentials caused duplicate records(CI/resources).  The credentials field should be blocked when the accessor account is used to prevent data corruption/data loss.
         * UI validation: Service account should contain the credential or accessor account, but not both of them. Because discovery is creating duplicate resource due to misconfiguration.
         **/
        if (accountClassType && accountClassType.equals('cmdb_ci_aws_datacenter') && (!gs.nil(serviceAccountInfo.discoveryCredentials) && serviceAccountInfo.discoveryCredentials != 'null') && (!gs.nil(accessorAccount) && accessorAccount != 'null')) {
            serviceAccount.errorDetail = gs.getMessage('The Service account can be set with either a credential or an accessor account.');
            return serviceAccount;
        }

        if ((accountClassType && accountClassType.equals('cmdb_ci_aws_datacenter')) && (!gs.nil(accessorAccount) && accessorAccount != 'null')) {
            var accessorServiceAccountInfo = this.CLOUD_DISCOVERY_UTIL.getServiceAccount(accessorAccount);
            //Member account: accessor account must not be allowed to be set as a any parent/master account.
            if ((!gs.nil(parentAccount) && parentAccount != 'null') && (parentAccount == accessorAccount)) {
                serviceAccount.errorDetail = gs.getMessage('Member accessor account cannot be a parent account.');
                return serviceAccount;
            }

            //Edit Service Account: Accessor account should not be same as current service account
            if ((serviceAccountInfo.sysId && serviceAccountInfo.sysId != 'null') && (accessorServiceAccountInfo && (accessorServiceAccountInfo.sys_id == serviceAccountInfo.sysId))) {
                serviceAccount.errorDetail = gs.getMessage('The Accessor account should be set with a different service account than the current one.');
                return serviceAccount;
            }
        }

        /**
         * DEF0297671 - Scenario: Edit Service Acc: AWS - Service Account has already validated using with credential.
         * Edit Service Account -> During the service account validating wihtout passing credential, MID resolve credential fetching the credential from the service account and it has been validated successfully. This is not proper validation.
         * UI validation: If existing service account validation -> verifying the service account info contains the credential OR accessor account and access role name. otherwise throwing the validation error. This validation only applicable for AWS master and normal account, not for member accounts. Normal and master account should be contain the credential or accessor account for account validation.
         * Note: Any aws account which is configured with IAM role and mid server is installed on that EC2 instance(from same account). it will not require any credentials or accessor account details. If user choosen the credential less MID server from CDU create schedule page UI, then credenital or accessor account not required.
         **/
        var accessRoleName = serviceAccountInfo.hasOwnProperty('accessRoleName') ? serviceAccountInfo.accessRoleName : '';
        if (!selectedCredentialLessMID && serviceAccountInfo.sysId && accountClassType && accountClassType.equals('cmdb_ci_aws_datacenter') && (gs.nil(parentAccount) || parentAccount == 'null') && (gs.nil(serviceAccountInfo.discoveryCredentials) || serviceAccountInfo.discoveryCredentials == 'null') && (gs.nil(accessRoleName) || accessRoleName == 'null') && (gs.nil(accessorAccount) || accessorAccount == 'null')) {
            serviceAccount.errorDetail = gs.getMessage('Required credential OR accessor account and access role name for validating service account.');
            return serviceAccount;
        }

        if (midCluster)
            midServer = this.CLOUD_DISCOVERY_UTIL.getRandomMidFromCluster(midCluster);

        // Validating Service Account ID is in proper format as per the datacenter type, if any value provided for account id
        var validationMessage = 'success';
        if (JSUtil.notNil(accountId)) {
            validationMessage = this._validateServiceAccountInfo(serviceAccountInfo);

            accountGR = this.CLOUD_DISCOVERY_UTIL.getServiceAccountByAccountID(accountId);
            if (serviceAccountInfo.isTimeout && accountGR && validationMessage.equals('success') && (accountGR.is_validated == '1')) {

                serviceAccount = this.getServiceAccountDetailsFromGR(accountGR);

                if (serviceAccount.isMasterAccount) {
                    serviceAccount['membersInfo'] = [];
                    var childGR = this.CLOUD_DISCOVERY_UTIL.getChildServiceAccountsByParentsAccountID(accountId);
                    while (childGR.next())
                        serviceAccount.membersInfo.push(this.getServiceAccountDetailsFromGR(childGR));
                }

                return serviceAccount;
            }
        }

        // The data retrieved from the CDU form, if it was provided with role name and accessor account reference and no credentials selected then only
        // it's valid to create the below entries in the "cmdb_ci_cloud_service_account" and "cloud_service_account_aws_cross_assume_role_params" table.
        // Along with above check we also check if the above validation is success or not because it includes the check if any other account, with same
        // account id, already exists in the system or not.
        var existingAccessorAccountRef = '',
            existingAccessRoleName = '',
            existingCredentialsRef = '';
        if (serviceAccountInfo.accessRoleName && accessorAccount && (!accountCredentialSysId || accountCredentialSysId != 'null') && 'success'.equals(validationMessage)) {
            // To support the AWS Accessor Account via CDU UI, entries in the Cloud Service Account and "AWS Cross Assume Role Params" are
            // expected to be existing already because when the MID tries to validate the cloud service accounts, discover datacenter, etc,
            // it uses the role to perform "AssumeRole".
            // One of the inputs for the entries in the "AWS Cross Assume Role Params" table is the Service Account that uses the accessor
            // account but it's the same one which the customer tries to validate. So its a kind of chicken-egg problem and for that reason,
            // we create the entries in respective tables manually.
            // If "serviceAccountInfo.sysId" is empty means its an "Add Account" scenario
            if (!serviceAccountInfo.sysId) {
                var newAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
                newAccountGR.initialize();
                newAccountGR.setValue('name', accountName);
                newAccountGR.setValue('datacenter_type', accountClassType);
                newAccountGR.setValue('account_id', accountId);
                newAccountGR.setValue('datacenter_url', accountUrl);
                newAccountGR.setValue('accessor_account', accessorAccount);
                var newAccountSysID = newAccountGR.insert();

                var newAccessRoleGR = new GlideRecord('cloud_service_account_aws_cross_assume_role_params');
                newAccessRoleGR.initialize();
                newAccessRoleGR.setValue('access_role_name', serviceAccountInfo.accessRoleName);
                newAccessRoleGR.setValue('cloud_service_account', newAccountSysID);
                newAccessRoleGR.insert();

                new MIDServerSystemCommandUtil().issueSystemCommandToSpecificMID('service_account_reload', midServer, [{
                    "name": "skip_debounce",
                    "value": "true"
                }]);
                // Post creation of account and roles, same details are synced up with the MID server so if we try to do the account
                // validation same time immediately then there are situations observed where account validation is failing. For that
                // reason, we explicitly added the sleep for 2 Secs expecting the sync between MID and Instance would take 1-2 Secs
                gs.sleep(2000); // 2 Secs
            } else {
                // Following code is executed for the "Select Account" scenario
                // We take the backup of existing data before we update the records with the new information customer has provided
                var existingAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
                if (existingAccountGR.get('sys_id', serviceAccountInfo.sysId)) {
                    existingAccessorAccountRef = existingAccountGR.getValue('accessor_account');
                    existingCredentialsRef = (existingAccountGR.getValue('discovery_credentials') == 'null' || existingAccountGR.getValue('discovery_credentials') === null) ? "" : existingAccountGR.getValue('discovery_credentials');

                    existingAccountGR.setValue('accessor_account', accessorAccount);
                    existingAccountGR.setValue('discovery_credentials', '');
                    existingAccountGR.update();
                }

                var existingAccessRoleGR = new GlideRecord('cloud_service_account_aws_cross_assume_role_params');
                if (existingAccessRoleGR.get('cloud_service_account', serviceAccountInfo.sysId)) {

                    // Service account having a role enabled but account is revalidated with new access role provided in the UI
                    // so we update respective entry
                    existingAccessRoleName = existingAccessRoleGR.getValue('access_role_name');
                    existingAccessRoleGR.setValue('access_role_name', serviceAccountInfo.accessRoleName);
                    existingAccessRoleGR.update();
                } else {
                    // Service account doesn't have any role enabled but account is revalidated with new access role provided in the UI
                    // so we insert a new entry
                    existingAccessRoleGR.initialize();
                    existingAccessRoleGR.setValue('cloud_service_account', serviceAccountInfo.sysId);
                    existingAccessRoleGR.setValue('access_role_name', serviceAccountInfo.accessRoleName);
                    existingAccessRoleGR.insert();
                }

                new MIDServerSystemCommandUtil().issueSystemCommandToSpecificMID('service_account_reload', midServer, [{
				 "name": "skip_debounce",
				  "value": "true"
			    }]);

                // Explicitly added the sleep for 2 Secs expecting the sync between MID and Instance would take 1-2 Secs
                gs.sleep(2000); // 2 Secs
            }
        }

        if (validationMessage.equals('success')) {
            var configObj = {
                "accountName": accountName,
                "accountId": accountId,
                "accountUrl": accountUrl,
                "accountType": accountClassType,
                "accountCredentialsId": accountCredentialSysId,
                "parentAccount": parentAccount,
                "accessorAccount": accessorAccount,
                "existingAccessRoleName": existingAccessRoleName,
                "existingAccessorAccountRef": existingAccessorAccountRef,
                "existingCredentialsRef": existingCredentialsRef,
                "flowType": flowType
            };

            // Before we trigger pattern to validate account, lets check if user has provided any form fields data.
            // Form Fields data is a fixed/static data that are used by cloud resources discovery pattern(s) and each
            // field is the actual column in the cloud service account so we need to pass that data to the patterns
            // as they are responsible for inserting/updating cloud service account
            var formFieldsData = this._getFormFieldsDataFromCDUFormData(serviceAccountInfo);
            if (formFieldsData && (Object.keys(formFieldsData).length))
                configObj['formFieldsData'] = JSON.stringify(formFieldsData);


            var statusId = this.CLOUD_WIZARD_DISCOVERY.validateAccount(configObj, midServer);
            if (statusId) {
                serviceAccount.statusName = this.CLOUD_DISCOVERY_UTIL.getDiscoveryStatusNumber(statusId + '');
                serviceAccount.statusId = statusId;
            } else
                serviceAccount.errorDetail = gs.getMessage('Failed to validate account so please retry');
        } else
            serviceAccount.errorDetail = validationMessage;

        return serviceAccount;
    },

    /**
     * API fetches the cloud account info based on the provided discovery status sys id.
     * Used during 'Test Account' and 'Refresh Members'
     *
     * @statusSysId - Sys Id of the Discovery Status created for Discovery Datacenters
     * @accountSysId - Sys Id of the Cloud Service Account selected
     */
    getServiceAccountInfoByStatusId: function(statusSysId, accountSysId, midServer) {
        var serviceAccount = {};
        var accountGR = '';
        var statusObj = this.CLOUD_WIZARD_DISCOVERY.getDiscoveryResult(statusSysId);
        var usePatternDiscovery = this.CLOUD_DISCOVERY_UTIL.getProviderUseCloudPatternProperty(accountSysId);
        var discoveryPhase = this._getPhaseOfTheTriggeredPattern(statusSysId);

        if (!statusObj || !statusObj.hasOwnProperty('ci_list')) {
            if (!statusObj)
                statusObj = {};

            statusObj.message = statusObj.message || ("Here are the details of the arguments passed to this script " + JSON.stringify(statusSysId, null, 2));
            serviceAccount.statusResult = statusObj;
            serviceAccount['valid'] = false;
            return serviceAccount;
        }

        if ((statusObj.ci_list).length == 0) {
            var prePatternExecutionData = this._getPrePatternExecutionDataOfTheTriggeredPattern(statusSysId);
            if (statusSysId && accountSysId && (discoveryPhase == 1 || discoveryPhase == 2)) {

                // Below condition will be true only if the request type is "Account Validation" and "accountSysId" isn't empty
                // because that means it's an "Select Account" scenario from the CDU.
                // As the account validation failed, the pattern returns no reponse so then we restore the previously working accessor
                // accountinformation in the Cloud Service Account table and previously working access role name in the AWS Crosss
                // Assume Role Params table.
                if (discoveryPhase == 1) {
                    if (prePatternExecutionData.existing_access_role_name && prePatternExecutionData.existing_accessor_account_ref) {
                        var existingAccessRoleName = prePatternExecutionData.existing_access_role_name;
                        var restoreAccessRoleGR = new GlideRecord('cloud_service_account_aws_cross_assume_role_params');
                        if (restoreAccessRoleGR.get('cloud_service_account', accountSysId) && existingAccessRoleName) {
                            restoreAccessRoleGR.setValue('access_role_name', existingAccessRoleName);
                            restoreAccessRoleGR.update();
                        }

                        var existingAccessorAccountRef = prePatternExecutionData.existing_accessor_account_ref;
                        var restoreAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
                        if (restoreAccountGR.get('sys_id', accountSysId) && existingAccessorAccountRef) {
                            restoreAccountGR.setValue('accessor_account', existingAccessorAccountRef);
                            restoreAccountGR.update();
                        }
                    } else if (prePatternExecutionData.existing_credentials_ref) {

                        // This use case is encountered when user tries with existing accounts, that has credentials associated,
                        // to use the accessor account path and if at all account validation phase fails then we restore the
                        // credentials reference and wipe the stub entries created as a part of accessor account validation flow

                        var existingCredentialsRef = prePatternExecutionData.existing_credentials_ref;
                        var restoreAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
                        if (restoreAccountGR.get('sys_id', accountSysId) && existingCredentialsRef) {
                            restoreAccountGR.setValue('accessor_account', '');
                            restoreAccountGR.setValue('discovery_credentials', existingCredentialsRef);
                            restoreAccountGR.update();
                        }

                        var delAccessRoleGR = new GlideRecord('cloud_service_account_aws_cross_assume_role_params');
                        if (delAccessRoleGR.get('cloud_service_account', accountSysId))
                            delAccessRoleGR.deleteRecord();
                    }
                }

                serviceAccount = this.getServiceAccountDetails(accountSysId);
                if (discoveryPhase == 1) {
                    // It's a test account action made and it failed because of wrong credentials
                    serviceAccount['valid'] = false;
                    serviceAccount['membersInfo'] = (this.getMemberServiceAccounts(accountSysId, false, null)).memberAccounts;
                } else {
                    // Discovery status returning no members information when 'Refresh Member Accounts'
                    // is clicked in the Config UI then we allow the user to proceed with schedule creation
                    serviceAccount['valid'] = true;
                    serviceAccount['membersInfo'] = [];
                }
                serviceAccount.statusResult = statusObj;
                return serviceAccount;
            }

            // Fetches result for given status sys id if anything fails
            if (accountSysId) {
                accountGR = this.CLOUD_DISCOVERY_UTIL.getServiceAccount(accountSysId + '');
                accountGR.is_validated = false;
                accountGR.update();
            }

            // Below condition will be true only if the request type is "Account Validation" and "accountSysId" is empty
            // because that means it's an "Add Account" scenario from the CDU.
            // As the account validation failed, the pattern returns no reponse so then we need to delete the respective entry
            // from the Cloud Service Account which inturn deletes the associated AWS Crosss Assume Role Params entry as well.
            if ((discoveryPhase == 1) && !accountSysId && prePatternExecutionData.accessor_account) {
                var cloudServiceAccountGR = new GlideRecord("cmdb_ci_cloud_service_account");
                if (cloudServiceAccountGR.get("account_id", prePatternExecutionData.account_id))
                    cloudServiceAccountGR.deleteRecord();
            }

            serviceAccount.statusResult = statusObj;
            serviceAccount['valid'] = false;
        } else if ((statusObj.ci_list).length == 1) {
            // Fetches result for given status sys id during 'Test Account'
            serviceAccount = this.getServiceAccountDetails(statusObj.ci_list[0].sys_id);
            accountGR = this.CLOUD_DISCOVERY_UTIL.getServiceAccount(serviceAccount.sysId);
            accountGR.is_validated = true;
            if (serviceAccount.isMasterAccount || (!serviceAccount.discoveryCredentials && serviceAccount.accessorAccount))
                accountGR.parent_account = '';

            // If account validation is done via Credentials and if successful then no need of accessor account
            // anymore and role entry in "cloud_service_account_aws_cross_assume_role_params" table isn't required
            // // so we need to wipe that information
            if (accountGR.discovery_credentials) {
                accountGR.accessor_account = '';

                var deleteAccessRoleGR = new GlideRecord('cloud_service_account_aws_cross_assume_role_params');
                if (deleteAccessRoleGR.get('cloud_service_account', serviceAccount.sysId))
                    deleteAccessRoleGR.deleteRecord();

                // Resetting the role and accessor account information in the object which is used in the CDU UI
                serviceAccount['accessRoleName'] = '';
                serviceAccount['accessorAccount'] = '';
            }

            accountGR.update();

            var isMasterAccount = serviceAccount.isMasterAccount;
            var cloudAccountSysId = serviceAccount.sysId;

            var gcpMemberAcc = (serviceAccount.datacenterClass == 'cmdb_ci_google_datacenter' && serviceAccount.organizationId);

            // Below check avoids the infinite loop when sub-account discovery patterns return only 1 account information in the
            // payload which is nothing but the account information provided in the CDU's "Test Account" form itself i.e., if
            // AWS Master Account (or) Azure Management Group (or) GCP Proj belonging to Org has no sub-account(s)/related account(s)
            //
            // The reason why we check for the discovery phase is to validate the account and trigger for members if it's master in
            // both "Add Account" and "Select Account" use case in CDU no matter if the system has the member/sub/related account(s)
            // already discovered.
            if ((isMasterAccount || gcpMemberAcc) && (discoveryPhase == 1)) {
                var memberAccsMap = this.initializeMemberAccountDiscovery(serviceAccount, true, midServer);
                serviceAccount['statusName'] = this.CLOUD_DISCOVERY_UTIL.getDiscoveryStatusNumber(memberAccsMap.statusId + '');
                serviceAccount['statusId'] = memberAccsMap.statusId;
            }
            serviceAccount['valid'] = true;
        } else if ((statusObj.ci_list).length > 1) {
            // Fetches result for given status sys id during 'Refresh Members'
            var allAccountsList = statusObj.ci_list;
            var allAccounts = {
                childAccs: [],
                masterAcc: []
            };
            var gcpAccounts = [];
            for (var i in allAccountsList) {
                var accountData = this.getServiceAccountDetails(allAccountsList[i].sys_id);
                if (JSUtil.notNil(accountData) && accountData.sysId != accountSysId) {
                    if (accountData.datacenterClass == 'cmdb_ci_google_datacenter' && accountData.organizationId)
                        gcpAccounts.push(accountData);
                    else
                        (accountData.isMasterAccount) ? allAccounts.masterAcc.push(accountData) : allAccounts.childAccs.push(accountData);
                }
            }

            gcpAccounts.filter(function(gcpAcc) {
                return !gcpAcc.exclude_from_discovery;
            });

            //Ignoring the member accounts whose "exclude_from_discovery" is true and show in the slush bucket accordingly
            var discoverableChildAccs = [];
            allAccounts.childAccs.forEach(function(childAcc) {
                if (!childAcc['excludeFromDiscovery'])
                    discoverableChildAccs.push(childAcc);
            });
            allAccounts.childAccs = discoverableChildAccs;

            // Updating parent_account field of master account to empty as Discover Member Accounts updates parent_account field of master account to refer to itself
            if (allAccounts.masterAcc.length) {
                accountGR = this.CLOUD_DISCOVERY_UTIL.getServiceAccount(allAccounts.masterAcc[0].sysId);
                accountGR.parent_account = '';
                accountGR.update();
                serviceAccount = allAccounts.masterAcc[0];
            }

            serviceAccount = allAccounts.masterAcc[0] || this.getServiceAccountDetails(accountSysId) || serviceAccount;
            serviceAccount['membersInfo'] = (allAccounts.hasOwnProperty('childAccs') && allAccounts.childAccs.length) ? allAccounts.childAccs : gcpAccounts;
            serviceAccount['valid'] = true;

            //Mark stale account as retired when property is not true and customer does Refresh Member Accounts from CDU UI
            var existingMemberAccounts = (this.getMemberServiceAccounts(serviceAccount.sysId, false, midServer)).memberAccounts;
            this.CLOUD_DISCOVERY_UTIL.deleteStaleAccountRecords(existingMemberAccounts, serviceAccount['membersInfo'], true, 'sysId');
            //If any account which was marked stale before but is reactivated again, mark it as installed
            var existingSubAccountsSysIDs = [];
            var reactivatedStaleAccounts = [];
            existingMemberAccounts.forEach(function(acc) {
                existingSubAccountsSysIDs.push(acc.sys_id ? acc.sys_id : acc.sysId);
            });
            reactivatedStaleAccounts = serviceAccount['membersInfo'].filter(function(accObj) {
                return (existingSubAccountsSysIDs.indexOf(accObj.sysId) == -1);
            });

            reactivatedStaleAccounts.forEach(function(accObj) {
                //If old stale account is rediscovered again, first mark them installed
                new CloudResourceDiscoveryUtil().markOldStaleInstalled(accObj, 'sysId');
            });
        }
        return serviceAccount;
    },

    /**
     * API initiates the member accounts discovery and returns Status Sys Id after triggering Pattern's API for AWS/Azure
     *
     * @discoverMemberAccounts - Boolean flag whether to discover member accounts
     * @serviceAccount - A map containing the Service Account Info like AccountId, SysId, ObjectId, Name, etc.
     */
    initializeMemberAccountDiscovery: function(serviceAccount, discoverMemberAccounts, midServer) {
        var memberStatusSysId = '';
        var resultForMemberServiceAccounts = {};
        var serviceAccounts = [];
        var accountSysId = serviceAccount.sysId + '';
        var childAccGR = new GlideRecord('cmdb_ci_cloud_service_account');

        childAccGR.addQuery('exclude_from_discovery', false);
        childAccGR.addQuery('install_status', '!=', '7');
        if (serviceAccount.datacenterClass == 'cmdb_ci_google_datacenter' && serviceAccount.organizationId) {
            childAccGR.addQuery('organization_id', serviceAccount.organizationId);
            childAccGR.addQuery('sys_id', '!=', accountSysId);
            childAccGR.query();
        } else {
            childAccGR.addQuery('parent_account', accountSysId);
            childAccGR.query();
        }

        if (discoverMemberAccounts) {
            memberStatusSysId = this.CLOUD_WIZARD_DISCOVERY.refreshMemberAccounts(accountSysId + '', midServer);
            resultForMemberServiceAccounts.statusName = this.CLOUD_DISCOVERY_UTIL.getDiscoveryStatusNumber(memberStatusSysId);
            resultForMemberServiceAccounts.statusId = memberStatusSysId;
        }

        if (JSUtil.nil(memberStatusSysId)) {
            //If there are no member accounts present for given service account then discover them else fetch from the table
            if (childAccGR.getRowCount() > 0) {
                while (childAccGR.next())
                    serviceAccounts.push(this.getServiceAccountDetailsFromGR(childAccGR));
            } else
                memberStatusSysId = this.CLOUD_WIZARD_DISCOVERY.refreshMemberAccounts(accountSysId + '', midServer);

            if (serviceAccounts.length > 0) {
                var cloudAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
                cloudAccountGR.get(accountSysId);
                /* GCP is a special case for which discovery supports the related projects via 'organization_id' as of today
                 * and in the near future, Super-Sub Accounts hierarchy via Master-Member framework of Cloud Service Account.
                 *
                 * Below check is to update the master cloud service account's "is_master" flag if at all pattern misses adding that information in any case
                 */
                if (!cloudAccountGR.is_master_account && !(cloudAccountGR.getValue('organization_id') && (cloudAccountGR.getValue('datacenter_type') == 'cmdb_ci_google_datacenter'))) {
                    cloudAccountGR.is_master_account = true;
                    cloudAccountGR.update();
                }
                resultForMemberServiceAccounts.memberAccounts = serviceAccounts;
            } else {
                resultForMemberServiceAccounts.statusName = this.CLOUD_DISCOVERY_UTIL.getDiscoveryStatusNumber(memberStatusSysId);
                resultForMemberServiceAccounts.statusId = memberStatusSysId;
            }
        }
        return resultForMemberServiceAccounts;
    },

    /*
     * When we trigger patterns for the "Test Account" Or "Refresh members" then a Discovery status is created.
     * In the ECC Queue's Payload Data, we've the pattern's sys_id responsible for either account validation or
     * sub accounts discovery or datacenter discovery.
     *
     * Once we get the pattern sys_id, we can query "sa_cloud_topology_discovery_pattern" table to know what the
     * phase is i.e., if
     *		phase is "1" then it's "1 - Account Validation"
     *		phase is "2" then it's "2 - Accounts Discovery"
     *		phase is "3" then it's "3 - Datacenters Discovery"
     *
     * @statusSysID - Sys Id of the Discovery Status created for config pattern triggered
     *
     */
    _getPhaseOfTheTriggeredPattern: function(statusSysID) {
        //Get any ECC Queue
        var discoveryPhase,
            eccQueueProbeParameters = this._getECCQueueProbeParametersForStatus(statusSysID);

        eccQueueProbeParameters.forEach(function(probeParamObj) {
            if (probeParamObj['@name'] == 'patternId') {
                var patternSysID = probeParamObj['@value'];
                var topologyGR = new GlideRecord('sa_cloud_topology_discovery_pattern');
                if (topologyGR.get('pattern', patternSysID))
                    discoveryPhase = Number(topologyGR.getValue('discover_topology_type'));
            }
        });

        return discoveryPhase;
    },

    _getPrePatternExecutionDataOfTheTriggeredPattern: function(statusSysID) {
        var patternExecutionInfo,
            eccQueueProbeParameters = this._getECCQueueProbeParametersForStatus(statusSysID);

        eccQueueProbeParameters.forEach(function(probeParamObj) {
            if (probeParamObj['@name'] == 'prePatternExecutionData') {
                var prePatternExecutionData = probeParamObj['@value'];
                if (prePatternExecutionData) {
                    patternExecutionInfo = JSON.parse(prePatternExecutionData);
                    patternExecutionInfo = (patternExecutionInfo.mapOfTables.service_account[0])[1];
                }
            }
        });

        return patternExecutionInfo;
    },

    _getECCQueueProbeParametersForStatus: function(statusSysID) {
        var payload, eccQueueProbeParameters = [];

        var eccQueueGR = new GlideRecord('ecc_queue');
        eccQueueGR.addQuery('agent_correlator', statusSysID);
        eccQueueGR.addQuery('queue', 'output');
        eccQueueGR.setLimit(1);
        eccQueueGR.query();
        if (eccQueueGR.next())
            payload = new XMLHelper().toObject('' + eccQueueGR.payload);

        if (payload && payload.hasOwnProperty('parameter')) {
            var probeParams = payload.parameter;
            (probeParams instanceof Array) ? (eccQueueProbeParameters = probeParams) : (eccQueueProbeParameters.push(probeParams));
        }

        return eccQueueProbeParameters;
    },

    _validateServiceAccountInfo: function(serviceAccountInfo) {
        var accountIDLabel;
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        var accountId = serviceAccountInfo.accountId;
        var accountClassType = serviceAccountInfo.datacenterClass;
        var recordSysId = serviceAccountInfo.hasOwnProperty('sysId') ? serviceAccountInfo.sysId : '';

        if (serviceAccountGR.get('account_id', accountId)) {
            if (serviceAccountInfo.isTimeout)
                return 'success';

            accountIDLabel = this.CLOUD_DISCOVERY_UTIL.fetchLabelForServiceAccountColumnInConfigUI('accountId', accountClassType);

            if (JSUtil.notNil(recordSysId)) {
                if (!(serviceAccountGR.getUniqueValue()).equals(recordSysId))
                    return gs.getMessage('Cannot update current record as there exists another record with same {0}', accountIDLabel);
            } else
                return gs.getMessage('Cannot insert current record as there exists another record with same {0}', accountIDLabel);
        }
        return 'success';
    },

    validateVMWareCredentials: function(credentialId, url) {
        var credentialGR = new GlideRecord('discovery_credentials');

        if (credentialGR.get(credentialId)) {

            /**
             * Verify to the External Credential Storage plugin has been activated and current credential is stored at external storage(i.e Credential not stored in instance)
             * Test credential validation process not required for external credential. Test credenntial validation is applicable for credential stored in the instance(i.e credential table)
             */
            var pluginMgrObj = new GlidePluginManager();
            if (pluginMgrObj.isActive("com.snc.discovery.external_credentials") && credentialGR.isValidField('use_high_security') && credentialGR.use_high_security)
                return 'success';

            var credentialData = {};
            credentialData['user_name'] = credentialGR.getValue('user_name');
            credentialData['password'] = credentialGR.password.getDecryptedValue();
            credentialData['name'] = credentialGR.getValue('name');
            credentialData['type'] = 'vmware';

            var ipAddress = this.CLOUD_DISCOVERY_UTIL.fetchIPFromURL(url);
            var activeMIDs = this.getActiveMidsByProvider('VMWare');
            if (activeMIDs.midsInfo.length == 0)
                return gs.getMessage('No Active MIDs found with VMWare Capability to validate credentials.');

            var eccQueueId = SNC.CredentialTest.test(JSON.stringify(credentialData), ipAddress, '443', activeMIDs.midsInfo[0].name);

            var gr = this.getECCQueueRecord(eccQueueId);
            while (gr.getRowCount() == 0)
                gr = this.getECCQueueRecord(eccQueueId);

            if (gr.next()) {
                var parser = new CredentialTestParser(gr.payload);
                return parser.getResult();
            }
        }
    },

    /*
    	vCenter URL Expected - "https://10.198.1.13/sdk" or "10.198.1.13/sdk"
    	Below method does the following checks for "https://10.198.1.13/sdk" format:
    		1. We split the given string into array so length should be 4 - [ 'https:', '', '10.198.1.13', 'sdk' ]
    		2. First array should be "https:" but not "https:s", "https:ss", "htttttps:" etc.
    		3. Last array should be "sdk" but not "sdkkk", "sdk123", etc.

    	and following checks if URL is provided as "10.198.1.13/sdk" format:
    		1. We split the given string into array so length should be 2- [ '10.198.1.13', 'sdk' ]
    		2. Second array should be "sdk" but not "sdk123", "sddk", "sd k:" etc.
    */
    validateVMWareURL: function(url) {
        var isInvalid;
        var arr = url.split('/');

        if (url.indexOf('https:') == -1) {
            isInvalid = (arr.length != 2) || (arr[1] != 'sdk');
            return (isInvalid) ? gs.getMessage('Invalid vCenter URL. Please provide a valid one in " {IP Address}/sdk " format without any braces (or) spaces.') : 'success';
        } else {
            isInvalid = (arr.length != 4) || (arr[0] != 'https:') || (arr[3] != 'sdk');
            return (isInvalid) ? gs.getMessage('Invalid vCenter URL. Please provide a valid one in " https://{IP Address}/sdk " format without any braces (or) spaces.') : 'success';
        }
    },

    getECCQueueRecord: function(eccQueueId) {
        var gr = new GlideRecord('ecc_queue');
        gr.addQuery('response_to', eccQueueId);
        gr.addQuery('state', 'ready');
        gr.query();

        return gr;
    },

    saveServiceAccount: function(serviceAccountInfo) {
        var accountIDLabel;
        var serviceAccountSysId;
        var existingServiceAccountGR;
        var serviceAccount = {};
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        var itsvCenterAccount = serviceAccountInfo.datacenterClass.equals('cmdb_ci_vcenter_datacenter');

        // Validating Service Account ID is in proper format as per the datacenter type
        var validationMessage = new ServiceAccountIdValidator().validateAccountId(serviceAccountInfo.accountId, serviceAccountInfo.datacenterClass);
        if (validationMessage.equals('success')) {

            if (itsvCenterAccount) {
                // Check the URL, as datacenter discovery needs in "https://{IP Address}/sdk" format
                validationMessage = this.validateVMWareURL(serviceAccountInfo.datacenterURL);

                // If URL looks ok then proceed to validate the credentials now
                if (validationMessage.equals('success'))
                    validationMessage = this.validateVMWareCredentials(serviceAccountInfo.discoveryCredentials, serviceAccountInfo.datacenterURL);
            }

            if (validationMessage.equals('success')) {

                // As datacenter discovery needs URL in the "https://10.198.1.13/sdk" format so we prefix it with the "https://" if user provides in "10.198.1.13/sdk" format
                if ((serviceAccountInfo.datacenterURL.indexOf('https:') == -1) && itsvCenterAccount)
                    serviceAccountInfo.datacenterURL = 'https://' + serviceAccountInfo.datacenterURL;

                accountIDLabel = this.CLOUD_DISCOVERY_UTIL.fetchLabelForServiceAccountColumnInConfigUI('accountId', serviceAccountInfo.datacenterClass);

                if (JSUtil.notNil(serviceAccountInfo.sysId) && serviceAccountGR.get(serviceAccountInfo.sysId)) {
                    serviceAccountGR = this.createServiceAccount(serviceAccountGR, serviceAccountGR.account_id, serviceAccountInfo);
                    existingServiceAccountGR = this.CLOUD_DISCOVERY_UTIL.getServiceAccountByAccountID(serviceAccountInfo.accountId);
                    if (existingServiceAccountGR && (serviceAccountGR.getUniqueValue() != existingServiceAccountGR.getUniqueValue()))
                        serviceAccount.errorDetail = gs.getMessage('Cannot update current record as there exists another record with same {0}', accountIDLabel);
                    else
                        serviceAccountSysId = serviceAccountGR.update();
                } else {
                    serviceAccountGR = this.createServiceAccount(serviceAccountGR, '', serviceAccountInfo);
                    existingServiceAccountGR = this.CLOUD_DISCOVERY_UTIL.getServiceAccountByAccountID(serviceAccountGR.getValue('account_id'));
                    if (existingServiceAccountGR)
                        serviceAccount.errorDetail = gs.getMessage('Cannot insert current record as there exists another record with same {0}', accountIDLabel);
                    else
                        serviceAccountSysId = serviceAccountGR.insert();
                }

                if (serviceAccountSysId)
                    serviceAccount = this.getServiceAccountDetails(serviceAccountSysId);
            } else
                serviceAccount.errorDetail = validationMessage;

            return serviceAccount;
        }
    },

    createServiceAccount: function(serviceAccountGR, accountId, serviceAccountInfo) {
        serviceAccountGR.setValue('name', serviceAccountInfo.name);

        if (JSUtil.nil(accountId) || !(accountId.equals(serviceAccountInfo.accountId)))
            serviceAccountGR.setValue('account_id', serviceAccountInfo.accountId);

        if (JSUtil.notNil(serviceAccountInfo.discoveryCredentials))
            serviceAccountGR.setValue('discovery_credentials', serviceAccountInfo.discoveryCredentials);

        serviceAccountGR.setValue('datacenter_type', serviceAccountInfo.datacenterClass);

        if (JSUtil.notNil(serviceAccountInfo.datacenterURL))
            serviceAccountGR.setValue('datacenter_url', serviceAccountInfo.datacenterURL);

        if (JSUtil.notNil(serviceAccountInfo.isMasterAccount))
            serviceAccountGR.setValue('is_master_account', serviceAccountInfo.isMasterAccount);

        if (JSUtil.notNil(serviceAccountInfo.parentAccount))
            serviceAccountGR.setValue('parent_account', serviceAccountInfo.parentAccount);

        return serviceAccountGR;
    },

    getServiceAccountDetails: function(serviceAccountId) {
        var serviceAccount;
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        if (serviceAccountGR.get(serviceAccountId)) {
            serviceAccount = this.getServiceAccountDetailsFromGR(serviceAccountGR);

            // Fetch access role name information as well for the AWS specific Cloud Service Account
            if (serviceAccount.datacenterClass == 'cmdb_ci_aws_datacenter') {
                var accessRoleGR = new GlideRecord('cloud_service_account_aws_cross_assume_role_params');
                if (accessRoleGR.get('cloud_service_account', serviceAccountId))
                    serviceAccount['accessRoleName'] = accessRoleGR.getValue('access_role_name');
            }

            if (this.CLOUD_SERVICE_ACCOUNT_FORM_FIELDS_METADATA instanceof Array)
                (this.CLOUD_SERVICE_ACCOUNT_FORM_FIELDS_METADATA).forEach(function(fieldName) {
                    serviceAccount[fieldName] = serviceAccountGR.getValue(fieldName);
                    // If at all the form field is an boolean then we get the value as either 1 or 0
                    // but CDU understands only boolean value so we do the conversion
                    if (serviceAccount[fieldName] == 1 || serviceAccount[fieldName] == 0)
                        serviceAccount[fieldName] = (serviceAccount[fieldName] == 1);
                });
        }
        return serviceAccount;
    },

    getServiceAccountDetailsFromGR: function(serviceAccountGR) {
        var serviceAccount;
        if (serviceAccountGR)
            serviceAccount = {
                sysId: serviceAccountGR.getUniqueValue() + '',
                name: serviceAccountGR.getValue('name'),
                accountId: serviceAccountGR.getValue('account_id'),
                discoveryCredentials: (serviceAccountGR.getValue('discovery_credentials') === null || serviceAccountGR.getValue('discovery_credentials') == 'null' ) ? '' : serviceAccountGR.getValue('discovery_credentials'),
                datacenterURL: serviceAccountGR.getValue('datacenter_url'),
                datacenterClass: serviceAccountGR.getValue('datacenter_type'),
                isMasterAccount: (serviceAccountGR.getValue('is_master_account') == 1),
                parentAccount: serviceAccountGR.getValue('parent_account'),
                sysUpdatedOn: serviceAccountGR.getValue('sys_updated_on'),
                valid: (serviceAccountGR.getValue('is_validated') == '1'),
                validatedOn: serviceAccountGR.getValue('sys_updated_on'),
                organizationId: serviceAccountGR.getValue('organization_id'),
                excludeFromDiscovery: (serviceAccountGR.getValue('exclude_from_discovery') == 1),
                accessorAccount: serviceAccountGR.getValue('accessor_account'),
                operational: (serviceAccountGR.getValue('install_status') == 1)
            };

        if (this.showPullEvent(serviceAccountGR.getValue('datacenter_type')))
            serviceAccount.shouldPullEvents = (serviceAccountGR.getValue('should_pull_events') == '1');
        return serviceAccount;
    },

    isServiceAccountDatacenterDiscovered: function(serviceAccount) {
        var ldcGR = new GlideRecord('cmdb_ci_logical_datacenter');
        this.CLOUD_DISCOVERY_UTIL.queryRelCIBasedOnChild(serviceAccount, 'Hosted on::Hosts', ldcGR);
        ldcGR.setLimit(1);
        ldcGR.query();
        return ldcGR.getRowCount() > 0;
    },

    getMidSelectionMethods: function() {
        var resultForMidSelectionTypes = {};
        var selectionTypeList = [];
        var choiceGR = new GlideRecord('sys_choice');
        choiceGR.addQuery('name', 'discovery_schedule');
        choiceGR.addQuery('element', 'mid_select_method');
        choiceGR.addQuery('language', gs.getUser().getLanguage());
        choiceGR.addQuery('value', "!=", 'behavior');
        choiceGR.query();

        if (choiceGR.getRowCount() > 0) {
            while (choiceGR.next()) {
                selectionTypeList.push({
                    value: choiceGR.getValue('value'),
                    label: choiceGR.getValue('label'),
                    helpText: this.midSelectionTypeHelpText[choiceGR.getValue('value')] ? this.midSelectionTypeHelpText[choiceGR.getValue('value')] : ''
                });
            }
        } else
            resultForMidSelectionTypes.errorDetail = gs.getMessage('No mid selection method(s) are found');

        resultForMidSelectionTypes.midSelectTypes = selectionTypeList;
        return resultForMidSelectionTypes;
    },

    saveCloudSchedule: function(scheduleData) {

        // Below is a safety check to stop the schedule creation if a normal cloud service account or a member cloud service
        // account is selected whose 'exclude_from_discovery' is "true". If it's a master account or master + member combination
        // then irrespective of the flag, we just let the schedule creation progress go further.
        var serviceAccInfo = this.getServiceAccountDetails(scheduleData.service_account + '');
        if (!serviceAccInfo.isMasterAccount && serviceAccInfo.excludeFromDiscovery)
            return {
                errorDetail: gs.getMessage("Selected account isn't a discoverable one")
            };

        var activeMidsInfo;
        var result = {};
        var provider = this.CLOUD_DISCOVERY_UTIL.getProviderByServiceAccount(scheduleData.service_account + '');

        if (provider) {
            activeMidsInfo = this.getActiveMidsByProvider(provider);
            if (activeMidsInfo.hasOwnProperty('errorDetail'))
                return {
                    errorDetail: activeMidsInfo.errorDetail
                };
        }

        if (JSUtil.notNil(this.CLOUD_DISCOVERY_UTIL.getCloudScheduleRecordByName(scheduleData.name, scheduleData.scheduleId))) {
            result['success'] = false;
            result['errorDetail'] = this.SCHEDULE_NAME_DUPLICATION_ERR_MSG;
            return result;
        }

        if (JSUtil.nil(scheduleData.scheduleId))
            result = this._createCloudSchedule(scheduleData);
        else
            result = this._updateCloudSchedule(scheduleData);

        if (result.success) {
            if (scheduleData.finishAndRun) {
                var scheduleGR = this.CLOUD_DISCOVERY_UTIL.getCloudScheduleRecord(result.scheduleId);
                if (scheduleGR)
                    var statusID = new Discovery().discoverNow(scheduleGR);
            }
        } else
            result.errorDetail = result.message;

        return result;
    },

    _createCloudSchedule: function(scheduleData) {
        var ciScheduleId = '';

        if (scheduleData.runType.equals('periodically') && JSUtil.nil(scheduleData.runPeriod)) {
            return {
                success: false,
                message: gs.getMessage('Run period must not be empty')
            };
        }

        var accelConfig = this._saveAcceleratorConfig(scheduleData);
        var scheduleRecord = new GlideRecord('discovery_schedule');
        scheduleRecord.initialize();
        scheduleRecord = this._createScheduleGlideRecord(scheduleRecord, scheduleData);
        scheduleRecord.setValue('discover', 'Cloud Resources');
        scheduleRecord.setValue('accel_config', accelConfig);

        if (scheduleData.is_Discover_VM) {
            ciScheduleId = this._createCISchedule(scheduleData);
            scheduleRecord.setValue('vm_run', ciScheduleId);
        }
        var scheduleId = scheduleRecord.insert();
        scheduleData['scheduleId'] = scheduleId;
        this._createCloudDiscoveryLDCConfig(scheduleData);
        if (JSUtil.notNil(ciScheduleId))
            this._updateCISchedule(ciScheduleId, scheduleId);

        return {
            success: true,
            scheduleId: scheduleId,
            message: ''
        };
    },

    _updateCloudSchedule: function(scheduleData) {
        var scheduleId;
        var scheduleRecord = this.CLOUD_DISCOVERY_UTIL.getCloudScheduleRecord(scheduleData.scheduleId);
        scheduleRecord = this._createScheduleGlideRecord(scheduleRecord, scheduleData);
        this._updateAcceleratorConfig(scheduleData, scheduleRecord.getValue('accel_config'));

        if (scheduleData.is_Discover_VM) {
            if (JSUtil.notNil(scheduleRecord.getValue('vm_run')))
                this._updateMidCISchedule(scheduleData, scheduleRecord.getValue('vm_run'));
            else {
                var ciScheduleId = this._createCISchedule(scheduleData);
                scheduleRecord.setValue('vm_run', ciScheduleId);
                if (JSUtil.notNil(ciScheduleId))
                    this._updateCISchedule(ciScheduleId, scheduleData.scheduleId);
            }
        } else {
            if (JSUtil.notNil(scheduleRecord.getValue('vm_run'))) {
                this._removeSchedule(scheduleRecord.getValue('vm_run'));
                scheduleRecord.setValue('vm_run', null);
            }
        }

        scheduleId = scheduleRecord.update();
        // To Do we need to run clean up operation based on flag
        this._removeCloudDiscoveryLDCConfig(scheduleData.scheduleId);
        this._createCloudDiscoveryLDCConfig(scheduleData);
        return {
            success: true,
            scheduleId: scheduleId,
            message: ''
        };

    },

    _saveAcceleratorConfig: function(scheduleData) {
        var accelRunGlideRecord = new GlideRecord('discovery_accel_config');
        accelRunGlideRecord.initialize();
        accelRunGlideRecord = this._createAcceleratorConfigGlideRecord(accelRunGlideRecord, scheduleData);
        return accelRunGlideRecord.insert();
    },

    _updateAcceleratorConfig: function(scheduleData, accel_config) {
        var accelRunGlideRecord = new GlideRecord('discovery_accel_config');
        accelRunGlideRecord.get(accel_config);
        accelRunGlideRecord = this._createAcceleratorConfigGlideRecord(accelRunGlideRecord, scheduleData);
        return accelRunGlideRecord.update();
    },

    _createScheduleGlideRecord: function(scheduleRecord, scheduleData) {
        scheduleRecord.setValue('name', scheduleData.name);
        scheduleRecord.setValue('disco_run_type', scheduleData.runType);
        scheduleRecord.setValue('active', scheduleData.active);
        var midSelectMethod = scheduleData.mid_select_method_for_cloud;

        if (JSUtil.notNil(midSelectMethod)) {
            scheduleRecord.setValue('mid_select_method', midSelectMethod);
            if (midSelectMethod.equals('specific_mid') && JSUtil.notNil(scheduleData.mid_server_for_cloud)) {
                scheduleRecord.setValue('mid_server', scheduleData.mid_server_for_cloud);
                scheduleRecord.setValue('mid_cluster', '');
            } else if (midSelectMethod.equals('specific_cluster') && JSUtil.notNil(scheduleData.mid_cluster_for_cloud)) {
                scheduleRecord.setValue('mid_cluster', scheduleData.mid_cluster_for_cloud);
                scheduleRecord.setValue('mid_server', '');
            } else {
                scheduleRecord.setValue('mid_server', '');
                scheduleRecord.setValue('mid_cluster', '');
            }
        } else {
            scheduleRecord.setValue('mid_select_method', 'auto_select');
            scheduleRecord.setValue('mid_server', '');
            scheduleRecord.setValue('mid_cluster', '');
        }

        if (JSUtil.notNil(scheduleData.script))
            scheduleRecord.setValue('script', scheduleData.script);

        if (JSUtil.notNil(scheduleData.runPeriod))
            scheduleRecord.setValue('run_period', new GlideDateTime(scheduleData.runPeriod));
        else
            scheduleRecord.setValue('run_period', '');

        if (JSUtil.notNil(scheduleData.runStart))
            scheduleRecord.setValue('run_start', new GlideDateTime(scheduleData.runStart));

        if (JSUtil.notNil(scheduleData.runTime))
            scheduleRecord.setValue('run_time', scheduleData.runTime);

        if (JSUtil.notNil(scheduleData.runDayOfWeek))
            scheduleRecord.setValue('run_dayofweek', scheduleData.runDayOfWeek);

        if (JSUtil.notNil(scheduleData.runDayOfMonth))
            scheduleRecord.setValue('run_dayofmonth', scheduleData.runDayOfMonth);

        if (JSUtil.notNil(scheduleData.maxRun))
            scheduleRecord.setValue('max_run', new GlideDateTime(scheduleData.maxRun));
        else
            scheduleRecord.setValue('max_run', new GlideDateTime(new Date(0)));

        return scheduleRecord;
    },

    _createAcceleratorConfigGlideRecord: function(accelRunGlideRecord, scheduleData) {
        accelRunGlideRecord.setValue('active', scheduleData.active);
        accelRunGlideRecord.setValue('run_type', scheduleData.runType);
        if (JSUtil.notNil(scheduleData.runTime))
            accelRunGlideRecord.setValue('run_time', scheduleData.runTime);

        if (JSUtil.notNil(scheduleData.runPeriod))
            accelRunGlideRecord.setValue('run_period', new GlideDateTime(scheduleData.runPeriod));
        else
            accelRunGlideRecord.setValue('run_period', '');

        if (JSUtil.notNil(scheduleData.runStart))
            accelRunGlideRecord.setValue('run_start', scheduleData.runStart);

        if (JSUtil.notNil(scheduleData.runDayOfWeek))
            accelRunGlideRecord.setValue('run_dayofweek', scheduleData.runDayOfWeek);

        if (JSUtil.notNil(scheduleData.runDayOfMonth))
            accelRunGlideRecord.setValue('run_dayofmonth', scheduleData.runDayOfMonth);

        if (JSUtil.notNil(scheduleData.maxRun))
            accelRunGlideRecord.setValue('max_run', new GlideDateTime(scheduleData.maxRun));
        else
            accelRunGlideRecord.setValue('max_run', new GlideDateTime(new Date(0)));

        return accelRunGlideRecord;
    },

    _createCloudDiscoveryLDCConfig: function(scheduleData) {
        var service_accounts = [];
        service_accounts.push({
            sysId: scheduleData.service_account + ''
        });

        if (scheduleData.all_accounts_for_master) {
            var usePatternDiscovery = this.CLOUD_DISCOVERY_UTIL.getProviderUseCloudPatternProperty(scheduleData.service_account);
            if (usePatternDiscovery) {
                var members = (this.getMemberServiceAccounts(scheduleData.service_account, false, null)).memberAccounts;
                service_accounts = service_accounts.concat(members);
            }
        } else if (scheduleData.member_accounts)
            service_accounts = service_accounts.concat(scheduleData.member_accounts);

        if (scheduleData.all_datacenter) {
            for (var accountIndex in service_accounts)
                this._saveCloudDiscoveryLDCConfig(service_accounts[accountIndex].sysId, scheduleData.scheduleId, "", scheduleData.all_accounts_for_master);
        } else {
            for (var account in service_accounts) {
                for (var ldc in scheduleData.datacenters) {
                    if (scheduleData.datacenters[ldc].selected)
                        this._saveCloudDiscoveryLDCConfig(service_accounts[account].sysId, scheduleData.scheduleId, scheduleData.datacenters[ldc].name, scheduleData.all_accounts_for_master);
                }
            }
        }
    },

    _saveCloudDiscoveryLDCConfig: function(service_account, scheduleId, ldc, all_accounts_for_master) {

        // Returning as we don't want to create ldc config with empty account details.
        if (!JSUtil.notNil(service_account))
            return;

        var ldcId = "";
        if (JSUtil.notNil(ldc))
            ldcId = this.CLOUD_DISCOVERY_UTIL.getLogicalDatacentersByNameAndServiceAccount(service_account, ldc);
        var gr = new GlideRecord('cmp_discovery_ldc_config');
        gr.initialize();
        gr.setValue('service_account', service_account);
        gr.setValue('discovery_schedule', scheduleId);
        if (JSUtil.notNil(ldcId))
            gr.setValue('ldc', ldcId);
        if (JSUtil.notNil(all_accounts_for_master))
            gr.setValue('all_accounts_for_master', all_accounts_for_master);
        return gr.insert();
    },

    _removeCloudDiscoveryLDCConfig: function(scheduleId) {
        var gr = new GlideRecord('cmp_discovery_ldc_config');
        gr.query('discovery_schedule', scheduleId);
        gr.deleteMultiple();
    },

    _createCISchedule: function(scheduleData) {
        var gr = new GlideRecord('discovery_schedule');
        gr.initialize();
        gr.setValue('discover', 'CIs');
        gr.setValue('disco_run_type', 'after_discovery');
        gr = this._createCIScheduleGlideRecord(gr, scheduleData);
        return gr.insert();
    },

    _updateCISchedule: function(ciScheduleId, scheduleId) {
        var gr = new GlideRecord('discovery_schedule');
        if (ciScheduleId && gr.get('sys_id', ciScheduleId)) {
            gr.setValue('run_after', scheduleId);
            return gr.update();
        }
    },

    _updateMidCISchedule: function(scheduleData, scheduleId) {
        var gr = new GlideRecord('discovery_schedule');
        if (scheduleId)
            gr.get('sys_id', scheduleId);
        gr = this._createCIScheduleGlideRecord(gr, scheduleData);
        return gr.update();
    },

    _createCIScheduleGlideRecord: function(gr, scheduleData) {
        gr.setValue('name', scheduleData.name + '- VM schedule');
        gr.setValue('mid_select_method', scheduleData.mid_select_method);

        if (JSUtil.notNil(scheduleData.discovery_agent))
            gr.setValue('discovery_agent', scheduleData.discovery_agent);

        if (scheduleData.mid_select_method.equals('specific_cluster') && JSUtil.notNil(scheduleData.mid_cluster)) {
            gr.setValue('mid_cluster', scheduleData.mid_cluster);
            gr.setValue('mid_server', '');
        } else if (scheduleData.mid_select_method.equals('specific_mid') && JSUtil.notNil(scheduleData.mid_server)) {
            gr.setValue('mid_server', scheduleData.mid_server);
            gr.setValue('mid_cluster', '');
        } else {
            gr.setValue('mid_server', '');
            gr.setValue('mid_cluster', '');
        }
        return gr;
    },

    _removeSchedule: function(scheduleId) {
        var gr = new GlideRecord('discovery_schedule');
        if (scheduleId && gr.get('sys_id', scheduleId))
            gr.deleteRecord();
    },

    getCloudSchedule: function(scheduleId) {
        var cloudScheduleInfo = {};
        var accelGlideRecord;
        var is_Discover_VM = false;
        var mid_select_type = '';
        var mid_cluster = '';
        var mid_server = '';
        var provider = '';
        var mid_select_method_for_cloud = '';
        var mid_server_for_cloud = '';
        var mid_cluster_for_cloud = '';
        var discovery_agent = 'mid';

        var scheduleRecord = this.CLOUD_DISCOVERY_UTIL.getCloudScheduleRecord(scheduleId);
        if (scheduleRecord) {
            var configData = new DiscoveryCloudConfig().getConfig(scheduleId);

            if (JSUtil.notNil(scheduleRecord.getValue('accel_config')))
                accelGlideRecord = this.CLOUD_DISCOVERY_UTIL.getAcceleratorConfigRecord(scheduleRecord.getValue('accel_config'));
            if (JSUtil.notNil(scheduleRecord.getValue('vm_run'))) {
                is_Discover_VM = true;
                var ipScheduleRecord = this.CLOUD_DISCOVERY_UTIL.getCloudScheduleRecord(scheduleRecord.getValue('vm_run'));
                mid_select_type = ipScheduleRecord.getValue('mid_select_method');
                mid_cluster = ipScheduleRecord.getValue('mid_cluster');
                mid_server = ipScheduleRecord.getValue('mid_server');
                discovery_agent = ipScheduleRecord.getValue('discovery_agent');
            }
            if (JSUtil.notNil(scheduleRecord.getValue('mid_select_method'))) {
                mid_select_method_for_cloud = scheduleRecord.getValue('mid_select_method');
                mid_server_for_cloud = scheduleRecord.getValue('mid_server');
                mid_cluster_for_cloud = scheduleRecord.getValue('mid_cluster');
            }
            if (configData.service_account)
                provider = this.CLOUD_DISCOVERY_UTIL.getProviderByServiceAccount(configData.service_account.sys_id);


            //Building the data as a response to the API call
            cloudScheduleInfo.scheduleId = scheduleId;
            cloudScheduleInfo.name = scheduleRecord.getValue('name');
            cloudScheduleInfo.provider = provider;
            cloudScheduleInfo.service_account = configData.service_account;
            cloudScheduleInfo.all_datacenter = configData.all_datacenters;
            cloudScheduleInfo.all_accounts_for_master = configData.all_accounts_for_master;
            cloudScheduleInfo.member_accounts = configData.member_accounts;
            cloudScheduleInfo.datacenters = configData.datacenters;
            cloudScheduleInfo.is_Discover_VM = is_Discover_VM;
            cloudScheduleInfo.vm_run = scheduleRecord.getValue('vm_run');
            cloudScheduleInfo.runAfter = scheduleRecord.getValue('run_after');
            cloudScheduleInfo.mid_selection_type = mid_select_type;
            cloudScheduleInfo.mid_cluster = mid_cluster;
            cloudScheduleInfo.mid_server = mid_server;
            cloudScheduleInfo.mid_select_method_for_cloud = mid_select_method_for_cloud;
            cloudScheduleInfo.mid_server_for_cloud = mid_server_for_cloud;
            cloudScheduleInfo.mid_cluster_for_cloud = mid_cluster_for_cloud;
            cloudScheduleInfo.discovery_agent = discovery_agent;

            if (accelGlideRecord) {
                cloudScheduleInfo.active = accelGlideRecord.active + '';
                cloudScheduleInfo.runType = accelGlideRecord.run_type + '';
                cloudScheduleInfo.runTime = accelGlideRecord.run_time + '';
                cloudScheduleInfo.runPeriod = accelGlideRecord.run_period + '';
                cloudScheduleInfo.runStart = accelGlideRecord.run_start + '';
                cloudScheduleInfo.runDayOfWeek = parseInt(accelGlideRecord.run_dayofweek, 10) || 1;
                cloudScheduleInfo.runDayOfMonth = parseInt(accelGlideRecord.run_dayofmonth, 10) || 1;
                cloudScheduleInfo.maxRun = accelGlideRecord.max_run + '';
            }
        } else
            cloudScheduleInfo.errorDetail = 'No discovery schedule found for the given sys id';

        return cloudScheduleInfo;
    },

    _resolveCloudType: function(dcType) {
        // locate the cloud provider type from the datacenter class name
        var cloudProvider = new GlideRecord('sn_capi_provider');
        var cloudType = cloudProvider.get('datacenter_class', dcType) ? cloudProvider.getValue('name') : '';
        return cloudType;
    },

    _getOrderStatus: function(orderSysID) {
        var orderGR = new GlideRecord('sn_cmp_order');
        if (orderGR.get(orderSysID))
            return Number(orderGR.getValue('status'));
        return null;
    },


    //	Scripted REST APIs util functions for backward compatibility

    getMemberAccountsRESTUtil: function(parentAccount, discoverMembers, selectedMidServer, isClusterSelected) {
        var selectedMid = this.getMidForDiscoveryJob(selectedMidServer, isClusterSelected);
        return this.getMemberServiceAccounts(parentAccount, JSUtil.toBoolean(discoverMembers), selectedMid);
    },

    getDiscoveredDataCenterRESTUtil: function(serviceAccountSysId, discoverDatacenters, selectedMidServer, clusterSelected) {
        var midServer = this.getMidForDiscoveryJob(selectedMidServer, clusterSelected);
        return this.getOrRefreshDatacenters(serviceAccountSysId, discoverDatacenters, midServer);
    },

    getMasterAccountRESTUtil: function(parentAccount, selectedMidServer, clusterSelected) {
        var serviceAccountObj = this.getServiceAccountDetails(parentAccount);
        var midServer = this.getMidForDiscoveryJob(selectedMidServer, clusterSelected);
        return this.initializeMemberAccountDiscovery(serviceAccountObj, true, midServer);
    },

    getMidForDiscoveryJob: function(selectedMidServer, clusterSelected) {
        var midServer = selectedMidServer != 'null' ? selectedMidServer : null;
        if (clusterSelected)
            midServer = new CloudResourceDiscoveryUtil().getRandomMidFromCluster(midServer);
        return midServer;
    },

    // TODO: THIS METHOD HAS TO BE DELETED ONCE IT'S USAGE in 'sys_ui_action_01c24d9ceb01320047f6a5115206fe93' FILE, IS REPLACED WITH 'getOrRefreshDatacenters'
    discoverDatacenters: function(serviceAccountSysId) {
        if (!serviceAccountSysId)
            throw gs.getMessage('Missing mandatory parameter service account id');

        var accountGr = new GlideRecord('cmdb_ci_cloud_service_account');
        accountGr.get(serviceAccountSysId);
        if (!accountGr.isValidRecord())
            throw gs.getMessage('Invalid service account Id - {0}', serviceAccountSysId);

        return this.discoverDatacentersViaCapi(serviceAccountSysId);
    },

    /*
     * As the usage of 'discoverDatacentersViaPattern' method is deprecated and datacenter discovery for all clouds except vmware
     * should go with patterns, this method takes care of discovering datacenters
     */
    getOrRefreshDatacenters: function(serviceAccountSysId, discoverDatacenters, midServer, subAccounts) {
        var accountGr = new GlideRecord('cmdb_ci_cloud_service_account');
        if (!(accountGr.get(serviceAccountSysId)))
            return {
                errorDetail: gs.getMessage('Provided account with SysId-{0} does not exist', serviceAccountSysId)
            };

        var dcType = accountGr.datacenter_type;
        var datacentersDetails = this.getDatacentersForServiceAccount(serviceAccountSysId, '');
        if (discoverDatacenters || (datacentersDetails.datacentersList.length == 0)) {
            try {
                if (dcType.equals('cmdb_ci_vcenter_datacenter')) {
                    datacentersDetails = this.discoverDatacentersViaCapi(serviceAccountSysId);
                    if (datacentersDetails.hasOwnProperty('error'))
                        return {
                            errorDetail: datacentersDetails.error
                        };
                } else {
                    if ((midServer + '' == 'null') || (midServer + '' == '')) 
                        midServer = null; // This will automatically be handled in the CLOUD_WIZARD_DISCOVERY.refreshDatacenters
                    var statusId = this.CLOUD_WIZARD_DISCOVERY.refreshDatacenters(serviceAccountSysId, midServer, subAccounts);
                    return {
                        resultData: {
                            statusName: this.CLOUD_DISCOVERY_UTIL.getDiscoveryStatusNumber(statusId),
                            statusId: statusId
                        }
                    };
                }
            } catch (err) {
                return {
                    errorDetail: err
                };
            }
        }
        if (datacentersDetails.hasOwnProperty('datacentersList'))
            return {
                resultData: datacentersDetails.datacentersList
            };
        else
            return {
                resultData: datacentersDetails
            };
    },

    _waitTillDiscoveryCompletes: function(statusId) {
        var resultObj = this.CLOUD_WIZARD_DISCOVERY.getDiscoveryResult(statusId);
        while (resultObj.state == 'processing') {
            this.sleep(2000);
            resultObj = this.CLOUD_WIZARD_DISCOVERY.getDiscoveryResult(statusId);
        }
        return resultObj;
    },

    /**
     * API discovers and fetches all the datacenters via CAPI, for the given service account
     *
     * @serviceAccountSysID – service account for which discovery has to be triggered and respective datacenters have to be fetched.
     */
    discoverDatacentersViaCapi: function(serviceAccountSysID) {
        var result = {};
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        if (serviceAccountGR.get(serviceAccountSysID)) {

            //let's check if we have a valid mid server
            var capiSvrScript = new sn_cloud_api.CAPIOrchestratorServiceScript();
            try {
                var cloudType = this._resolveCloudType(serviceAccountGR.datacenter_type);
                capiSvrScript.resolveMid('', cloudType, '');
            } catch (e) {
                result.error = e.message;
                return result;
            }

            //Querying resourceblock for the specific datacenter type
            var resource = '';
            var resourceblockGR = new GlideRecord('sn_cmp_rb_resourceblock');
            if (resourceblockGR.get('refcitype', serviceAccountGR.datacenter_type))
                resource = resourceblockGR.name + '';

            if (!resource) {
                result.error = gs.getMessage('Cannot find resource type for {0}', serviceAccountGR.datacenter_type);
                return result;
            }

            //Placing an order to discover the datacenters
            var orderScript = new sn_cmp_api.OrderServiceScript();
            var order = {
                'resource': resource,
                'entityType': 'Resource',
                'operationName': 'Discovery Interface.ListDatacenters',
                orderFormData: {
                    'CloudServiceAccountId': serviceAccountGR.account_id + '',
                    'Credential': serviceAccountGR.discovery_credentials.sys_id + ''
                }
            };
            var orderJson = orderScript.submitOrder(new global.JSON().encode(order));

            //Checking status of the order recursivly until order's state is "Rejected" / "Cancelled" / "Completed" / "Error"
            var orderObj = new global.JSON().decode(orderJson);
            var status = this._getOrderStatus(orderObj.id);
            while (!(status == 4 || status == 5 || status == 7 || status == 8)) {
                this.sleep(2000);
                status = this._getOrderStatus(orderObj.id);
            }

            result = this.getDatacentersForServiceAccount(serviceAccountSysID);
            result.order = orderObj;
            return result;
        }
    },

    getListofIPAddressesForVMSchedule: function(vmScheduleId) {
        var ipAddressList = [];
        //fetch service account for the given vm schedule based on the parent cloud schedule
        var scheduleGR = new GlideRecord('discovery_schedule');
        scheduleGR.addQuery('vm_run', vmScheduleId);
        scheduleGR.addQuery('discover', 'Cloud Resources');
        scheduleGR.query();

        if (scheduleGR.next()) {
            var parentScheduleId = scheduleGR.getUniqueValue();
            var configData = new DiscoveryCloudConfig().getConfig(parentScheduleId);

            var datacenterType = configData.service_account.datacenter_type;
            var serviceAccountId = configData.service_account.sys_id;

            this.fetchIPByLDC(serviceAccountId, configData.datacenters, ipAddressList, datacenterType);
            //is_master_account will always be false for the GCP cloud discovery schedule though it has siblings account.
            //Hence, an additional check is included for GCP cloud discovery in order to fetch the IP addresses of the VMs
            //that are in all the projects
            if (configData.is_master_account || (datacenterType == 'cmdb_ci_google_datacenter' && configData.service_account.organization_id)) {
                var membersAccounts = configData.all_accounts_for_master ? this.getMemberServiceAccounts(serviceAccountId, false, null).memberAccounts : configData.member_accounts;

                for (var i in membersAccounts) {
                    var memberServiceAccountId = membersAccounts[i].sys_id ? membersAccounts[i].sys_id : membersAccounts[i].sysId;
                    this.fetchIPByLDC(memberServiceAccountId, configData.datacenters, ipAddressList, datacenterType);
                }
            }
        }

        // Final check for removing the duplicates before so that IPs, added for the deep discovery, aren't redundant.
        ipAddressList = ipAddressList.filter(function(ip, index) {
            return (ipAddressList.indexOf(ip) == index);
        });

        return ipAddressList;
    },

    fetchIPByLDC: function(serviceAccountId, selectedDCs, ipAddressList, datacenterType) {
        if (selectedDCs) {
            var ldcNames = [];
            for (var i in selectedDCs)
                ldcNames.push(selectedDCs[i].name + '');

            // Apart from Normal Schedule, In the combination of Master Member especially when exclude_from_discovery=true
            // for master accountThe Datacenters provided
            var relGR = new GlideRecord('cmdb_rel_ci');
            relGR.addQuery('child', serviceAccountId);
            relGR.addQuery('type', this.CLOUD_DISCOVERY_UTIL.getRelTypeId('Hosted on::Hosts'));
            relGR.addQuery('parent.name', 'IN', ldcNames);
            relGR.query();
            while (relGR.next())
                this.populateIPAddressList(relGR.getValue('parent'), ipAddressList, datacenterType);
        } else {
            var ldcGR = new GlideRecord('cmdb_ci_logical_datacenter');
            this.CLOUD_DISCOVERY_UTIL.queryRelCIBasedOnChild(serviceAccountId, 'Hosted on::Hosts', ldcGR);
            ldcGR.query();
            while (ldcGR.next())
                this.populateIPAddressList(ldcGR.getUniqueValue(), ipAddressList, datacenterType);
        }
    },

    populateIPAddressList: function(ldcId, ipAddressList, datacenterType) {
        if (datacenterType.equals('cmdb_ci_vcenter_datacenter'))
            this.fetchIPAddressesForVMWare(ldcId, ipAddressList);
        else {
            var nicGR,
                vmSysIDsList = [],
                nicIdList = [];

            //get all vms hosted on given LDC and feth the public_ip of the selected vm.
            var vmGR = new GlideRecord('cmdb_ci_vm_instance');
            vmGR.addQuery('state', 'on');
            this.CLOUD_DISCOVERY_UTIL.queryRelCIBasedOnChild(ldcId, 'Hosted on::Hosts', vmGR);
            vmGR.query();

            while (vmGR.next()) {
                vmSysIDsList.push(vmGR.getUniqueValue());

                var enic = new GlideRecord('cmdb_ci_endpoint_vnic');
                this.CLOUD_DISCOVERY_UTIL.queryRelCIBasedOnParent(vmGR.getUniqueValue(), 'Use End Point To::Use End Point From', enic);
                enic.query();
                while (enic.next())
                    enic.getValue('object_id') ? nicIdList.push(enic.getValue('object_id')) : '';
            }

            if (nicIdList.length) {
                nicGR = new GlideRecord('cmdb_ci_nic');
                nicGR.addQuery('object_id', 'IN', nicIdList);
                nicGR.addQuery('install_status', '=', '1');
                nicGR.addNullQuery('cmdb_ci');
                nicGR.query();
                this._addIPsToTheList(nicGR, ipAddressList);
            }

            if (vmSysIDsList.length) {
                nicGR = new GlideRecord('cmdb_ci_nic');
                nicGR.addQuery('cmdb_ci', 'IN', vmSysIDsList);
                nicGR.query();
                this._addIPsToTheList(nicGR, ipAddressList);
            }
        }
    },

    _addIPsToTheList: function(nicGR, ipAddressList) {
        while (nicGR.next()) {
            if (JSUtil.notNil(nicGR.public_ip))
                ipAddressList.push(nicGR.getValue('public_ip'));
            if (JSUtil.notNil(nicGR.ip_address))
                ipAddressList.push(nicGR.getValue('ip_address'));
            if (JSUtil.notNil(nicGR.private_ip))
                ipAddressList.push(nicGR.getValue('private_ip'));
        }
    },

    fetchIPAddressesForVMWare: function(ldcId, ipAddressList) {
        var vmSysIDsList = [];

        var datastoreGR = new GlideRecord('cmdb_ci_vcenter_datastore');
        this.CLOUD_DISCOVERY_UTIL.queryRelCIBasedOnParent(ldcId, 'Contains::Contained by', datastoreGR);
        datastoreGR.query();

        while (datastoreGR.next()) {
            var vmGR = new GlideRecord('cmdb_ci_vm_instance');
            this.CLOUD_DISCOVERY_UTIL.queryRelCIBasedOnParent(datastoreGR.sys_id, 'Provides storage for::Stored on', vmGR);
            vmGR.query();

            while (vmGR.next())
                vmSysIDsList.push(vmGR.getUniqueValue());
        }

        var nicGR = new GlideRecord('cmdb_ci_nic');
        nicGR.addQuery('cmdb_ci', 'IN', vmSysIDsList);
        nicGR.query();
        this._addIPsToTheList(nicGR, ipAddressList);

        // Remove the duplicates
        return new DiscoArrayUtil().unique(ipAddressList);
    },

    getListOfSSMAgentsForVMSchedule: function(vmScheduleId) {
        var ssmAgentList = [];
        //fetch service account for the given vm schedule based on the parent cloud schedule
        var scheduleGR = new GlideRecord('discovery_schedule');
        scheduleGR.addQuery('vm_run', vmScheduleId);
        scheduleGR.addQuery('discover', 'Cloud Resources');
		scheduleGR.setLimit(1);
        scheduleGR.query();

        if (scheduleGR.next()) {
            var parentScheduleId = scheduleGR.getUniqueValue();
            var configData = new DiscoveryCloudConfig().getConfig(parentScheduleId);
            var serviceAccountSysId = configData.service_account.sys_id;
            var serviceAccountId = configData.service_account.account_id;
            this.fetchSSMAgentsByLDC(serviceAccountSysId, configData.datacenters, ssmAgentList, serviceAccountId);

            if (configData.is_master_account) {
                var membersAccounts = configData.all_accounts_for_master ? this.getMemberServiceAccounts(serviceAccountSysId, false, null).memberAccounts : configData.member_accounts;

                for (var i in membersAccounts) {
                    var memberServiceAccountSysId = membersAccounts[i].sys_id ? membersAccounts[i].sys_id : membersAccounts[i].sysId;
                    var memberServiceAccountId = membersAccounts[i].account_id ? membersAccounts[i].account_id : membersAccounts[i].accountId;
                    this.fetchSSMAgentsByLDC(memberServiceAccountSysId, configData.datacenters, ssmAgentList, memberServiceAccountId);
                }
            }
        }

        // Remove duplicates if present
        var agentByIp = {};
        ssmAgentList.forEach(function(ssmAgent) { agentByIp[ssmAgent.ip_address] = ssmAgent; });
        ssmAgentList = Object.keys(agentByIp).map(ip => agentByIp[ip]);
        return ssmAgentList;
    },

    fetchSSMAgentsByLDC: function(serviceAccountSysId, selectedDCs, ssmAgentList, serviceAccountId) {
        if (selectedDCs) {
            var ldcNames = [];

            for (var i in selectedDCs)
                ldcNames.push(selectedDCs[i].name + '');

            var relGR = new GlideRecord('cmdb_rel_ci');
            relGR.addQuery('child', serviceAccountSysId);
            relGR.addQuery('type', this.CLOUD_DISCOVERY_UTIL.getRelTypeId('Hosted on::Hosts'));
            relGR.addQuery('parent.name', 'IN', ldcNames);
            relGR.query();
            while (relGR.next())
                this.populateSSMObjectList(serviceAccountId, relGR.getValue('parent'), ssmAgentList);
        } else {
            var ldcGR = new GlideRecord('cmdb_ci_logical_datacenter');
            this.CLOUD_DISCOVERY_UTIL.queryRelCIBasedOnChild(serviceAccountSysId, 'Hosted on::Hosts', ldcGR);
            ldcGR.query();
            while (ldcGR.next())
                this.populateSSMObjectList(serviceAccountId, ldcGR.getUniqueValue(), ssmAgentList);
        }
    },

    populateSSMObjectList: function(serviceAccountId, ldcId, ssmAgentList) {

        var region = '';
        var ldcGR = new GlideRecord('cmdb_ci_aws_datacenter');

        if (ldcGR.get('sys_id', ldcId))
            region = ldcGR.getValue('region') + '';

        var vmGR = new GlideRecord('cmdb_ci_vm_instance');
        vmGR.addQuery('state', 'on');
        this.CLOUD_DISCOVERY_UTIL.queryRelCIBasedOnChild(ldcId, 'Hosted on::Hosts', vmGR);

        // Fetch VM instances that runs a Cloud Management Agent
        var relGR = vmGR.addJoinQuery('cmdb_rel_ci', 'sys_id', 'child');
        relGR.addCondition('type', this.CLOUD_DISCOVERY_UTIL.getRelTypeId('Runs on::Runs'));
        relGR.addCondition('parent.sys_class_name', 'cmdb_ci_cloud_system_management_agent');
        vmGR.query();

        while (vmGR.next()) {

            var ssmGR = new GlideRecord('cmdb_ci_cloud_system_management_agent');
            ssmGR.addQuery('object_id', vmGR.getValue('object_id'));
            ssmGR.addQuery('cloud_agent_type',  'AWS SSM'); // Fetching only the AWS SSM agents
            ssmGR.addQuery('operational_status', 1); // Operational
            ssmGR.addQuery('resource_type', 'EC2Instance'); // Hybrid instances are not supported in phase 1 release

            if (gs.getProperty('glide.discovery.ssm.enable_windows', 'false') == 'false') {
                gs.debug('SSM Windows property is disabled. Adding non-windows query.');
                ssmGR.addQuery('operating_system_platform', '!=', 'Windows');
            }

            ssmGR.setLimit(1);
            ssmGR.query();

            if (!ssmGR.next()) {
                gs.error('Operational EC2 SSM record not found for VM with object ID : ' + vmGR.getValue('object_id'));
                continue;
            }

            var ssmAgentObject = {};
            ssmAgentObject.os_type = ssmGR.getValue('operating_system_platform') + '';
            ssmAgentObject.instance_id = ssmGR.getValue('object_id') + '';
            ssmAgentObject.ip_address = ssmGR.getValue('ip_address') + '';
            ssmAgentObject.region = region;
            ssmAgentObject.service_account_id = serviceAccountId;
            ssmAgentList.push(ssmAgentObject);
        }
    },

    sleep: function(ms) {
        Packages.java.lang.Thread.sleep(ms);
    },

    /**
     * BELOW API IS A TEMPORARY API FOR BACKUP PURPOSE AND CONTINUOUS SUPPORT BY OWNER CANNOT BE GUARANTEED
     * SO IT'S RECOMMENDED NOT TO BE USED
     *
     * FUNCTIONALITY: Validate Cloud Service Account via Pattern's API
     */
    validateAndSaveServiceAccountViaPattern: function(serviceAccountInfo) {
        var recordSysId = serviceAccountInfo.hasOwnProperty('sysId') ? serviceAccountInfo.sysId : '';
        var cloudAccountValidateRequest = this.initializeValidateAccount(serviceAccountInfo);
        if (cloudAccountValidateRequest.hasOwnProperty('statusId')) {
            var discoveryStatusId = cloudAccountValidateRequest.statusId;
            this._waitTillDiscoveryCompletes(discoveryStatusId);
            var resultObj = this.getServiceAccountInfoByStatusId(discoveryStatusId, recordSysId, null);
            if ((!resultObj.valid) || resultObj.hasOwnProperty('membersInfo'))
                return resultObj;

            if (resultObj.hasOwnProperty('statusId')) {
                var tempDiscoveryStatusId = resultObj.statusId;
                this._waitTillDiscoveryCompletes(tempDiscoveryStatusId);
                var resultObj2 = this.getServiceAccountInfoByStatusId(discoveryStatusId, recordSysId, null);
                if (resultObj2.hasOwnProperty('membersInfo'))
                    return resultObj2;
            }
        } else
            return cloudAccountValidateRequest;
    },

    /**
     * BELOW API IS A TEMPORARY API FOR BACKUP PURPOSE AND CONTINUOUS SUPPORT BY OWNER CANNOT BE GUARANTEED
     * SO IT'S RECOMMENDED NOT TO BE USED
     *
     * FUNCTIONALITY: Discovers and fetches all the datacenters via Patterns, for the given service account
     */
    discoverDatacentersViaPattern: function(accountSysId) {
        var datacentersList = [];
        var statusId = this.CLOUD_WIZARD_DISCOVERY.refreshDatacenters(accountSysId);
        var resultObj = this._waitTillDiscoveryCompletes(statusId);
        if (resultObj.ci_list.length > 0)
            return this.getDatacentersForServiceAccount(accountSysId);
        else
            return resultObj;
    },

    /**
     * BELOW API IS A TEMPORARY API FOR BACKUP PURPOSE AND CONTINUOUS SUPPORT BY OWNER CANNOT BE GUARANTEED
     * SO IT'S RECOMMENDED NOT TO BE USED
     *
     * FUNCTIONALITY: Discovers the member accounts via Patterns, for the given master account.
     */
    getMemberAccountsForMasterViaPattern: function(accountSysId, midServer) {
        var resultForMemberAccounts = {};
        var serviceAccount = this.getServiceAccountDetails(accountSysId);
        var discoveryStatusSysId = (this.initializeMemberAccountDiscovery(serviceAccount, true, midServer)).statusId;
        this._waitTillDiscoveryCompletes(discoveryStatusSysId);
        var statusResult = this.getServiceAccountInfoByStatusId(discoveryStatusSysId, accountSysId, midServer);
        resultForMemberAccounts.memberAccountDetails = statusResult.membersInfo;
        return resultForMemberAccounts;
    },

    isMigrated: function(provider) {
        var result = false;
        //Note that VMWare cloud provider is not supports pattern
        if (provider == 'AWS' || provider == 'Azure') {
            var patternSysIdObj = {
                'AWS': '23881e159fc5320048111f80a57fcfde',
                'Azure': 'b3e27695d730320097eb6ccf6e61034e'
            };
            if (Object.keys(patternSysIdObj).indexOf(provider) != -1) {
                var gr = new GlideRecord('sn_cmp_rb_op_impl_step');
                gr.addQuery('sys_id', patternSysIdObj[provider]);
                gr.query()
                if (gr.next())
                    result = gr.getValue('enabled') == "0" ? true : false;
            }
        } else if (provider != 'VMware')
            result = true;

        return {
            result: result
        }
    },

    /**
        The following condition should be matching for showing GCP pull event option in the service account form
        1.'Discovery and Service Mapping' plugin is installed and its version should be '1.0.42'/more
        2.CI class is equal to CMDB_CI_GOOGLE_DATACENTER
        3.Field name is equal to shouldPullEvents(This field is showing in the service account form, once installed the discovery and service mapping plugin)
        @Arg1 -> Datacenter CI class
    **/
    showPullEvent: function(datacenterClass) {

        var isShowPullEventInServiceAccForm = (datacenterClass == this.CLOUD_DISCOVERY_UTIL.CMDB_CI_GOOGLE_DATACENTER && this.VALID_GCP_PULL_EVENT_ITOM_PATTERN_VERSION) || (datacenterClass != this.CLOUD_DISCOVERY_UTIL.CMDB_CI_GOOGLE_DATACENTER);

        if (isShowPullEventInServiceAccForm)
            this.showPullEventInServiceAccForm = true;

        return isShowPullEventInServiceAccForm;
    },

    updateServiceAccount: function(cloudAccountData) {
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        serviceAccountGR.query('datacenter_type', cloudAccountData.datacenterClass);
        serviceAccountGR.query('sys_id', cloudAccountData.sysId);

        if (serviceAccountGR.next()) {
            serviceAccountGR.setValue('should_pull_events', cloudAccountData.shouldPullEvents);
            serviceAccountGR.update();
        }
    },

    type: 'CloudDiscoveryScheduleConfig'
};
