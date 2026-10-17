(function executeQuery(v_table, v_query) {
    
    //Open task record instead of virtual table record
    if (v_query.isGet()) {
        gs.setRedirect("task.do?sys_id=" + v_query.getSysId());
        return;
    }
    var query = v_query.getEncodedQuery();
    var table = v_query.getParameter('table');
    if (GlidePluginManager.isActive('sn_km_gen_ai') && !gs.nil(query)) {
		new global.KMGenAISimilarTaskSearchUtil().getTasks(query, table, v_table);
        
    } else return;
})(v_table, v_query);
