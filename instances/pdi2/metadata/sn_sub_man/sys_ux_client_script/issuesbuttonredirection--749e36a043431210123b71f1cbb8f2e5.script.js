/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const issuesTabID = api.state.issuesTabID;
    let table;
    if(issuesTabID === 't1'){
        table = 'ua_custom_table_inventory';
    };
    if(issuesTabID === 't2') {
        table = 'sys_app';
    };
    const url = "/now/nav/ui/classic/params/target/" + table + "_list.do";
    // navigating to plaform
    api.emit('NAV_ITEM_SELECTED', {
			external: {
				url: url,
				},
		});
}
