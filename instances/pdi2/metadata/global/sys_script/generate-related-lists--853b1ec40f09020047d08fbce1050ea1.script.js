/**
 *	In this business rule, we define which related lists should be shown depending
 *	on the discovery type of the schedule.
 *	
 *	In the section 1, we create lists of related lists, each with a name.
 *	
 *	In the section 2, we map different discovery types to the appropriate list of
 *	related lists. Each key in the map corresponds to a discovery type, and the
 *	value is the name of one of the list of related lists.
 *	
 *	We add each name, list of related lists pair to g_scratchpad.relatedLists,
 *	and we add every related list to g_scratchpad.all.
 *	
 *	Using these maps and lists of related lists, the client script
 *	RelatedList Toggle Function shows and hides the appropriate
 *	related lists based on the discovery type
 */

// to create a new set of lists associated with a discovery type,
// follow the numbered instructions

// 1. create your new set of lists with a key, add to appropriate list set
var discoverChoiceListSet = [
	{key: 'host', lists: ['discovery_range_item.schedule', 'discovery_schedule_range.dscheduler', 'REL:b0bbda2f5b65201048501e991e81c7c5']},
	{key: 'autoSched', lists: ['REL:89324a57e730130058890a6103f6a94b', 'REL:b0bbda2f5b65201048501e991e81c7c5']},
	{key: 'hostless', lists: ['discovery_ptrn_hostless_lchr.schedule']},
	{key: 'cloud', lists: ['discovery_ptrn_cld_lchr.schedule']},
	{key: 'webService', lists: ['dscy_sch_wb_srvc_acct_m2m.schedule']},
	{key: 'service', lists: []},
	{key: 'certificates', lists: ['sn_disco_certmgmt_cert_url_sched_m2m.schedule', 'discovery_ptrn_hostless_lchr.schedule']}
];

// 2. map the discover field value to your new set of lists
// if a schedule's discover field value is not a key in this map, we will show
// a) the autoSched lists if quick_config is true
// b) the host lists otherwise
g_scratchpad.mapDiscoverToListKey = {
	'Web Service': 'webService',
	'Cloud' : 'cloud',
	'Hostless' : 'hostless',
	'Service' : 'service',
	'Certificates' : 'certificates'
};

// all is a set that contains all related lists above
var all = {};
g_scratchpad.relatedLists = {};

discoverChoiceListSet.forEach(processKeyListPair);
g_scratchpad.all = all;

// add lists to g_scratchpad.relatedLists using the key and add lists to all
function processKeyListPair(keyListPair) {
	var key = keyListPair.key;
	var lists = keyListPair.lists;
	g_scratchpad.relatedLists[key] = lists;
	for (var i = 0; i < lists.length; i++) {
		all[lists[i]] = true;
	}
}
