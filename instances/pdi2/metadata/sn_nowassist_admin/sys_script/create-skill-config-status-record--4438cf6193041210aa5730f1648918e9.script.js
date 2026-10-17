(function executeRule(current, previous /*null when async*/ ) {
    NAASkillConfigManipulatorUtil._insertSkillConfigStatusFromBR(current.getValue('sys_id'), {
        active: current.getValue('active') ?? "0",
        in_product_active: current.getValue('in_product_active') ?? "0",
        in_product_roles: current.getValue('in_product_roles'),
        sys_domain: current.getValue('sys_domain'),
        sys_domain_path: current.getValue('sys_domain_path')
    });
})(current, previous);
