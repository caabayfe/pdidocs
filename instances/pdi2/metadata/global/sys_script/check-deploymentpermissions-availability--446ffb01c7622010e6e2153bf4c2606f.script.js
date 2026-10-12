(function executeRule(current, previous /*null when async*/ ) {

    var propManageUpdateSet = 'com.snc.dd.manage_update_set_enabled';
    var propPublishToUpdateSet = 'com.snc.dd.publish_to_update_set_enabled';
    var propPublishToAppStore = 'com.snc.dd.publish_to_app_store_enabled';
    var propPublishToAppRepo = 'com.snc.dd.publish_to_app_repo_enabled';
    var propUpgradeApp = 'com.snc.dd.upgrade_app_enabled';

    var deploymentPermSetProps = {
        "Manage Update Set": {
            "propValue": gs.getProperty(propManageUpdateSet, false),
            "propName": propManageUpdateSet
        },
        "Publish To Update Set": {
            "propValue": gs.getProperty(propPublishToUpdateSet, false),
            "propName": propPublishToUpdateSet
        },
        "Publish To App Store": {
            "propValue": gs.getProperty(propPublishToAppStore, true),
            "propName": propPublishToAppStore
        },
        "Publish To App Repo": {
            "propValue": gs.getProperty(propPublishToAppRepo, true),
            "propName": propPublishToAppRepo
        },
        "Upgrade App": {
            "propValue": gs.getProperty(propUpgradeApp, true),
            "propName": propUpgradeApp
        }
    };

    var permissionName = current.permission.name;
    var permConfig = deploymentPermSetProps[permissionName];

    if (permConfig && permConfig.propValue == 'false') {
        gs.addInfoMessage(gs.getMessage('Cannot assign permission {0} to the descriptor because {1} is set to false', permissionName, permConfig.propName));
        current.setAbortAction(true);
    }

})(current, previous);
