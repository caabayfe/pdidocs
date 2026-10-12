var SOWChartMigrationUtil = Class.create();
SOWChartMigrationUtil.prototype = {
    initialize: function() {
        this.TIER1_MIGRATION_STATUS_SETTING = "ed94472343041210907f7ebba7b8f207";
        this.TIER2_MIGRATION_STATUS_SETTING = "ec54032343041210907f7ebba7b8f249";
        this.ootbPARDashboardDetails = {
            "tier1": {
                "sysId": "f671f450477bca5096bc6095d36d43d7",
                "yourWorkTabSysId": "3a71bc50477bca5096bc6095d36d4391",
                "yourTeamWorkTabSysId": "948274d0477bca5096bc6095d36d4383"
            },
            "tier2": {
                "sysId": "fcbe50e8473f0e5096bc6095d36d43d6",
                "yourWorkTabSysId": "34bed0e8473f0e5096bc6095d36d43a8",
                "yourTeamWorkTabSysId": "6d59e868477f0e5096bc6095d36d43d1"
            },
        };
        this.hasErrors = false;
    },
    getMigratedDashboardConfig: function(dashboardConfig, tier, tierConfig) {
        dashboardConfig.layout.tabs.forEach(function(tab) {
            try {
                var existingComponentProps = JSON.parse(tab.layout[0].component_props);
            } catch (error) {
                this.hasErrors = true;
                gs.error("Configurable chart migration: SOWChartMigrationUtil: Unable to parse techinal dashboard configuration for {0}: {1}", tier, error.toString());
                return;
            }
            var donutConfig = tab.sys_id === this.ootbPARDashboardDetails[tier].yourWorkTabSysId ? tierConfig.yourWorkDonutConfig : tierConfig.yourTeamWorkDonutConfig;

            tab.layout = donutConfig.map(function(config, index) {
                var updatedComponentProps = Object.assign({}, existingComponentProps, {
                    "headerTitle": config.header,
                    "metrics": config.metric,
                    "dataSources": config.datasource,
                    "groupBy": config.groupBy,
                    "showRegister": config.showRegister,
                    "colorConfig": config.colorConfig,
                    "additionalGroupByConfig": config.additionalGroupByConfig
                });
                return {
                    "component_props": JSON.stringify(updatedComponentProps),
                    "component_id": "a2b0596cec6b9d49dd1ff9bf76b5084b",
                    "can_edit": true,
                    "w": 12,
                    "h": 12,
                    "x": (index * 12) % 48,
                    "y": parseInt(index / 4) * 12
                };
            });
        }, this);
        return dashboardConfig;
    },
    updateTier1ChartMigartionStatus: function(status) {
        var configSettingGR = new GlideRecord("sn_sow_cfg_stg");
        configSettingGR.get(this.TIER1_MIGRATION_STATUS_SETTING);
        configSettingGR.setValue("value", JSON.stringify({
            migrated_from: "sow-admin-center",
            status: status
        }));
        configSettingGR.update();
    },
    updateTier2ChartMigartionStatus: function(status) {
        var configSettingGR = new GlideRecord("sn_sow_cfg_stg");
        configSettingGR.get(this.TIER2_MIGRATION_STATUS_SETTING);
        configSettingGR.setValue("value", JSON.stringify({
            migrated_from: "sow-admin-center",
            status: status
        }));
        configSettingGR.update();
    },
    getChartMigrationStatus: function() {
        var tier1MigrationStatus = null;
        var tier2MigrationStatus = null;

        var configSettingGR = new GlideRecord("sn_sow_cfg_stg");
        if (configSettingGR.get(this.TIER1_MIGRATION_STATUS_SETTING)) {
            try {
                tier1MigrationStatus = JSON.parse(configSettingGR.getValue("value")).status;
            } catch (error) {
                this.hasErrors = true;
                gs.error("Configurable chart migration: SOWChartMigrationUtil: Unable to parse Tier 1 Chart migration status: {0}", error.toString());
            }
        }
        if (configSettingGR.get(this.TIER2_MIGRATION_STATUS_SETTING)) {
            try {
                tier2MigrationStatus = JSON.parse(configSettingGR.getValue("value")).status;
            } catch (error) {
                this.hasErrors = true;
                gs.error("Configurable chart migration: SOWChartMigrationUtil: Unable to parse Tier 2 Chart migration status: {0}", error.toString());
            }
        }

        return {
            tier1MigrationStatus: tier1MigrationStatus,
            tier2MigrationStatus: tier2MigrationStatus
        };
    },
    type: 'SOWChartMigrationUtil'
};
