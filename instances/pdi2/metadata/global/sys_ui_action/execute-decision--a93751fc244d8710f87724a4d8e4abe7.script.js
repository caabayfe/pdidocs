function confirmAndSubmit() {
  var decision = g_form.getValue('decision');
  var title, body, buttonsHtml, requiresSubmit;

  if (decision === 'grant') {
    title = getMessage('Grant Basic Auth Access Role');
    body = '<p>' + getMessage('This will grant the <strong>snc_basic_auth_api_access</strong> role to this user, allowing their basic auth access to continue when enforcement begins.') + '</p>' +
           '<p style="margin-top:10px;"><strong>' + getMessage('Are you sure you want to grant the basic auth access role to this user?') + '</strong></p>';
    buttonsHtml = '<button class="btn btn-default" style="margin-right:8px;" onclick="window._confirmAction(\'cancel\')">' + getMessage('Cancel') + '</button>' +
                  '<button class="btn btn-primary" onclick="window._confirmAction(\'confirm\')">' + getMessage('Grant Role') + '</button>';
    requiresSubmit = true;
  } else if (decision === 'no_grant') {
    title = getMessage('Deny Basic Auth Access');
    body = '<p>' + getMessage('This user will <strong>not</strong> be granted the snc_basic_auth_api_access role. Their basic auth access will fail when enforcement begins.') + '</p>' +
           '<p style="margin-top:10px;"><strong>' + getMessage('Are you sure you want to deny basic auth access for this user?') + '</strong></p>';
    buttonsHtml = '<button class="btn btn-primary" onclick="window._confirmAction(\'confirm\')">' + getMessage('Ok') + '</button>';
    requiresSubmit = true;
  } else if (decision === 'converted') {
    title = getMessage('Convert to Web Service Access Only');
    body = '<p>' + getMessage('This will convert the user to a web service access only user. They will be unable to make UI logins, but basic authentication will continue to work for this account. No roles will be assigned.') + '</p>' +
           '<p style="margin-top:10px;"><strong>' + getMessage('Are you sure you want to convert this user to a web service access only user?') + '</strong></p>';
    buttonsHtml = '<button class="btn btn-default" style="margin-right:8px;" onclick="window._confirmAction(\'cancel\')">' + getMessage('Cancel') + '</button>' +
                  '<button class="btn btn-primary" onclick="window._confirmAction(\'confirm\')">' + getMessage('Convert User') + '</button>';
    requiresSubmit = true;
  } else if (decision === 'global') {
    title = getMessage('Apply Global Default Decision');
    body = '<p>' + getMessage('globalExecuteDecisionBody') + '</p><p style="margin-top:10px;"><strong>' + getMessage('Are you sure you want to proceed with this action for this user?') + '</strong></p>';
    buttonsHtml = '<button class="btn btn-default" style="margin-right:8px;" onclick="window._confirmAction(\'cancel\')">' + getMessage('Cancel') + '</button>' +
                  '<button class="btn btn-primary" onclick="window._confirmAction(\'confirm\')">' + getMessage('Confirm') + '</button>';
    requiresSubmit = true;
  } else {
    alert(getMessage('Please select a decision before executing.'));
    return;
  }

  var gm = new GlideModal('confirm_action');
  gm.setTitle(title);
  gm.renderWithContent(
    '<div style="padding:15px;">' +
      body +
      '<div style="text-align:right; margin-top:16px;">' +
        buttonsHtml +
      '</div>' +
    '</div>'
  );

  window._confirmAction = function(choice) {
    gm.destroy();
    if (choice === 'confirm' && requiresSubmit) {
      gsftSubmit(null, g_form.getFormElement(), 'server_execute_decision');
    }
  };
}
