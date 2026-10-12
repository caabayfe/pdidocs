var sampleMap = new GCFSampleMap();
sampleMap.put('action_source', 'plan_list_view');

var retrieveURL = new sn_utc.UpgradePlanAPI().getRetrieveUpgradePlanUrl();
var releaseName = retrieveURL.split("Upgrade Plan - ")[1];
if (JSUtil.notNil(releaseName))
	sampleMap.put('release_name', releaseName);

GCFCollector.recordUsageEvent('custom_metric', 'upgrade_to_customized', 'upgrade_plan_retrieve', sampleMap);
action.setRedirectURL(encodeURI(retrieveURL));
