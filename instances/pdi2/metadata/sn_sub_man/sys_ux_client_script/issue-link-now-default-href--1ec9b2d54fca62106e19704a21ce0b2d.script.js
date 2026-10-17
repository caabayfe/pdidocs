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
    return url;
}
