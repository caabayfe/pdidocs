var isBuPluginInstalled = NAAPluginUtil.isBuPluginInstalled();
var isHRSDPluginInstalled = NAAPluginUtil.isHRSDPluginInstalled();
answer = (isBuPluginInstalled && isHRSDPluginInstalled && !NAASkillConfigUtil.checkLicenseForFulfillerSKU()) ? true : false;
