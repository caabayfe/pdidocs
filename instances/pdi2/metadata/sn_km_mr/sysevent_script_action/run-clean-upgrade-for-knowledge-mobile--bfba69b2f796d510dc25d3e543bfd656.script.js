var upgradeMetaData = new sn_km_mr.MobileCardViewMigrationConstants().SYS_SG_ITEM_VIEW_MAP;
var upgradeEngine = new global.MobileUtahUpgradeCommonUtils();
upgradeEngine.cleanUpgradeLegacyCards(upgradeMetaData);
