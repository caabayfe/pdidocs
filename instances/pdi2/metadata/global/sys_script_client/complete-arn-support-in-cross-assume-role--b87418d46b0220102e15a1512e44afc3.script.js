function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var accessRoleNameCtrl = g_form.getControl('access_role_name');
    accessRoleNameCtrl.placeholder = getMessage('Enter complete ARN');
    var arn_template = 'Standard cloud ARN template - arn:aws:service:region:account:resourcetype/resource, Gov cloud ARN template - arn:aws-us-gov:service:region:account:resourcetype/resource';
    g_form.showFieldMsg('access_role_name', arn_template, 'info');
}
