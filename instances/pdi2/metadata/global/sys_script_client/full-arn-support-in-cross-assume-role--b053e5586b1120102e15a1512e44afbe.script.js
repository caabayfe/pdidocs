function onSubmit() {
    var accessRoleName = g_form.getValue('access_role_name');
    if (!accessRoleName.startsWith('arn:aws')) {
        g_form.addErrorMessage('Provided value in the Access Role Name field is not a complete ARN. Please provide a complete ARN');
        return false;
    }
}
