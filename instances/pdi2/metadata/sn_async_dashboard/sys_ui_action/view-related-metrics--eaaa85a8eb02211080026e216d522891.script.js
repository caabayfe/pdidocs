var table = current.alert_configuration.table;
var condition = current.alert_configuration.condition;


action.setRedirectURL(table + '_list.do?sysparm_order=interval_end&sysparm_order_direction=desc&sysparm_query=' + condition);
