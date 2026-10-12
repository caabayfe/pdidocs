      var UXADADataGenerator = Class.create();
      UXADADataGenerator.prototype = {
          initialize: function() {
              this.SYS_VIZ_DATA_SOURCE = "sys_viz_data_source";
              this.LEGACY_QUERY_API = "/instance/par/data";
              this.LEGACY_ALL_APPS_API = "/instance/apps/all";
              this.uxaUtils = new UXAUtils();
              this.logger = QueryServiceApiLogger.getLogger('UXADADataGenerator');
              this.config = {
                  app_table_name: "DataVizQuery",
                  app_record_id: "rec_id"
              };
          },
          shouldUseLegacyDSL: function() {
              return this.uxaUtils.isLegacyDashboardEnabled();
          },
          isNewUIConfiguration: function(requestBody) {
              let useNewUI = false;
              if (requestBody?.dataConfigurations) {
                  requestBody.dataConfigurations.forEach(item => {
                      if (item.uiType == 'uxa') {
                          useNewUI = true;
                      }
                  });
              }
              return useNewUI;
          },
          generateDAData: function(requestBody) {
              // parse the requestbody modify the DSL and continue
              var updatedRequestBody = JSON.parse(requestBody);
              const useLegacyDSL = this.shouldUseLegacyDSL();
              const isUXA = this.isNewUIConfiguration(updatedRequestBody);
              // NOTE: Do not add any logic for NextGen Processing here - Everything should go in UXAHandler
              if (useLegacyDSL && !isUXA) {
                  let isAllAppsNotFetched = true;
                  let allApps = {};
                  updatedRequestBody?.dataConfigurations?.forEach((dataConfiguration) => {
                      const predicateComposition = dataConfiguration?.predicateComposition;
                      if (predicateComposition) {
                          dataConfiguration['filterQuery'] = new UXALegacyPredicateProcessor().getDSL(predicateComposition);
                      }
                      dataConfiguration['api_key'] = dataConfiguration['api_key'] || dataConfiguration['APIKey'];
                      if (!dataConfiguration['api_key'] && dataConfiguration['AppSysId']) {
                          if (isAllAppsNotFetched) {
                              allApps = this.getLegacyAllApps();
                              isAllAppsNotFetched = false;
                          }
                          dataConfiguration['api_key'] = allApps[dataConfiguration['AppSysId']];
                      }
                  });
                  return this.processLegacyAPI(updatedRequestBody);
              } else {
                  // Note: In DA all the user related data is processed as Users even though we want sessions count wrt to Users. 
                  // But QueryService does not have type=Users hence we need to make this adjustment from DA side to support backward compatibility
                  updatedRequestBody?.dataConfigurations?.forEach((dataConfiguration) => {
                      const apiKey = dataConfiguration['api_key'] || dataConfiguration['APIKey'];
                      if (dataConfiguration['type'] === 'users') {
                          dataConfiguration['type'] = 'sessions';
                          dataConfiguration['metric'] = 'count';
                          dataConfiguration['metricField'] = 'users';
                      }
                      // check if ApiKey is present in data configuration. If so, convert it to apikey by split method.
                      if (apiKey && !dataConfiguration['AppSysId']) {
                          dataConfiguration['AppSysId'] = apiKey.split(":").slice(-1)[0];
                      }
                  });
                  return JSON.stringify(new UXAHandler().handleDARequest(updatedRequestBody));
              }
          },
          processLegacyAPI: function(requestBody) {
              this.config.endpoint = this.LEGACY_QUERY_API;
              var client = new AppseeServiceHttpClient(this.config, requestBody);
              var response = client.doPost(requestBody);
              return JSON.stringify(response["result"]);
          },
          getLegacyAllApps: function() {
              this.config.endpoint = this.LEGACY_ALL_APPS_API;
              var client = new AppseeServiceHttpClient(this.config, {});
              var response = client.doPost();
              return Array.isArray(response) ? response.reduce((acc, appData) => {
                  acc[appData?.AppSysId] = appData['APIKey'];
                  return acc;
              }, {}) : {};
          },
          type: 'UXADADataGenerator'
      };
