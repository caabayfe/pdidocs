function script({
    api,
    event,
    helpers
}) {
    const readOnlyRoleDisplayValue = helpers.translateSync('Read-only');
    const adminRoleDisplayValue = helpers.translateSync('Admin');
    const roleToDisplayValueMap = {
        'sn_admin_center.read_only': readOnlyRoleDisplayValue,
        'admin': adminRoleDisplayValue,
    };

    const lastSharedUsers = api.data.look_up_last_shared.results || [];

    return lastSharedUsers.map(u => {

        return {
            name: u.user._reference.name.displayValue,
            subtitle: u.user._reference.email.displayValue,
            role: roleToDisplayValueMap[u.role._reference.sys_name.displayValue] || ''
        };

    });
}
