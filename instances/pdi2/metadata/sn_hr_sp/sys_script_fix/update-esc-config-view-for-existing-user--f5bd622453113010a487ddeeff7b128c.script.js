var EC_APP_MODULE = 'd7a3b29644013410f877e29d0519246b';

var moduleGr = new GlideRecord('sys_app_module');

if (new GlidePluginManager().isActive('com.sn_ex_employee_center_pro') && moduleGr.get(EC_APP_MODULE)) {
    moduleGr.setValue('view_name', '');
    moduleGr.update();
}
