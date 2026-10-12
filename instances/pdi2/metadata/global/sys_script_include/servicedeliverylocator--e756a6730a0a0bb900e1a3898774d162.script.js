var ServiceDeliveryLocator = Class.create();

ServiceDeliveryLocator.prototype = {
  initialize : function() {
  },

  getServiceDelivery : function(/* String */ user_id, /* String */ business_service) {
    var answer = _checkUser(user_id, business_service);
    if (answer)
        return answer;

    answer = _checkGroup(user_id, business_service);
    if (answer)
        return answer;

    var u = GlideUser.getUserByID(user_id);
    answer = _checkDept(u.getDepartmentID(), business_service);
    if (answer)
        return answer;

    return _checkLocation(u.getLocation(), business_service);
  },

  _query : function(gr) {
     gr.addQuery('service_offering.parent', business_service);
     gr.orderBy('order');
     gr.query();
     if (gr.next())
       return gr.service_offering + '';
  },

  _checkLocation : function(location_id, business_service) {
     var gr = new GlideRecord('service_subscribe_location');
     gr.addQuery('cmn_location', location_id);
     return _query(gr);
  },

  _checkDept : function(dept_id, business_services) {
     var gr = new GlideRecord('service_subscribe_department');
     gr.addQuery('cmn_department', dept_id);
     return _query(gr);
  },

  _checkUser : function(user_id, business_service) {
     var gr = new GlideRecord('service_subscribe_sys_user');
     gr.addQuery('sys_user', user_id);
     return _query(gr);
  },

  _checkGroup : function(user_id, business_service) {
     var groups = GlideUser.getMyGroups(user_id);
     if (groups.isEmpty())
        return;

     var gr = new GlideRecord('service_subscribe_sys_user_grp');
     gr.addQuery('sys_user_group', groups);
     return _query(gr);
  }
}
