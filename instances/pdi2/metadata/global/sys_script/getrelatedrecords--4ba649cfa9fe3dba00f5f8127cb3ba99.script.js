function getRelatedRecords(table, field, value, target) {    
    gs.log("Get Related: " + table + "-" + field + "-" + value + "-" + target);
    if (table == 'cmdb_ci')
        return getRelatedCI(table, value);
    if (target = 'sys_user_group')
        return getRelatedGroup(value);
    return new Array();
}

function getRelatedCI(table, value) {
    gs.log("Getting related CI's");
    var answer = new Array(); 
    var g = new SncRelationships(); 
    var list = g.genRelatedRecords(value, null, table, table, null);
    for (var i=0; i < list.size(); i++) {
       var str = list.getChoice(i).getValue().toString();
       answer.push(str);
    }			
    return answer;
}

function getRelatedGroup(value) {
    gs.log("Getting users from related Groups");
    var answer = new Array();
    var groups = getGroupsInHierarchy(value);
    var mtm = new GlideRecord('sys_user_grmember');
    mtm.addEncodedQuery("groupIN" + groups.join(","));
    mtm.query();
    while (mtm.next()) {
       answer.push(mtm.user.toString());
    }
    return answer;
}

function getGroupsInHierarchy(value) {   
    gs.log("Getting the groups in the hierarchy");
    var answer = new Array();
    answer.push(value);
    var groups = new GlideRecord('sys_user_group');
    groups.initialize();
    if (groups.isValidField('parent'))
       groups.addQuery("parent", value);
    else if (groups.isValidField('u_parent'))
       groups.addQuery('u_parent', value);
    else
       return answer;
    groups.query();
    while (groups.next()) {
       answer.push(groups.sys_id.toString());
    }
    return answer;
}
