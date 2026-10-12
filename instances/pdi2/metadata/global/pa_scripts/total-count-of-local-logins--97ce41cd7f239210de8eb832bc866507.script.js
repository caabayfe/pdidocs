getCount();

/**
 * It Collects count of records from 'sys_user_login_history' which matches below glide-query filter
 * i.e. (authentication_method_used = DB OR authentication_method_used = LDAP)
 */
function getCount() {
    var result = 0;
    var gr = new GlideAggregate('sys_user_login_history');
    var queryOrCondition = gr.addQuery('authentication_method_used', 'DB');
    queryOrCondition.addOrCondition('authentication_method_used', 'LDAP');
    gr.addQuery('login_status', 'SUCCESS');
    gr.addAggregate("COUNT");
    gr.query();
    if(gr.next()) {
        result = gr.getAggregate('COUNT');
    }
    return result;
}
