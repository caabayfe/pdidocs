(function(){

    var skillConfigGr = new GlideRecord('sn_nowassist_skill_config');
    var skillConfigStatusGr;
    skillConfigGr.query();

    while (skillConfigGr.next()){
        skillConfigStatusGr = new GlideRecord('sn_nowassist_skill_config_status');
        skillConfigStatusGr.get('skill_config', skillConfigGr.sys_id);
        if (gs.nil(skillConfigStatusGr.getValue('sys_id'))){
            skillConfigStatusGr.newRecord();
            skillConfigStatusGr.active = skillConfigGr.getValue('active') ?? "0",
            skillConfigStatusGr.in_product_active = skillConfigGr.getValue('in_product_active') ?? "0",
            skillConfigStatusGr.in_product_roles = skillConfigGr.getValue('in_product_roles'),
            skillConfigStatusGr.sys_domain = skillConfigGr.getValue('sys_domain'),
            skillConfigStatusGr.sys_domain_path = skillConfigGr.getValue('sys_domain_path')
            skillConfigStatusGr.skill_config = skillConfigGr.getValue('sys_id');
            skillConfigStatusGr.insert();
            gs.info('Added skill config status record for ' + skillConfigGr.getValue('name'));
        }
    }
      var naaGlobalUtil = new global.NowAssistAdminGlobalScopedUtil();
      var updateColumn = naaGlobalUtil.updateColumn.bind(naaGlobalUtil);
      updateColumn('sn_nowassist_skill_config', 'active', 'active', false);
      updateColumn('sn_nowassist_skill_config', 'in_product_roles', 'active', false);
      updateColumn('sn_nowassist_skill_config', 'in_product_active', 'active', false);
})();
