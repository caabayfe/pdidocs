function onChange(control, oldValue, newValue, isLoading) {
  if (isLoading || !newValue) {
    return;
  }

  var choiceValue = g_form.getValue('action');
  var message = '';

  switch (choiceValue) {
    case '1':
      message = getMessage('Sets the resolution status of Upgrade History Log to ‘always_retain’');
      break;
    case '2':
      message = getMessage('Reverts the record and keeps it marked as inactive. After a successful revert, no other rules get executed.');
      break;
    case '3':
      message = getMessage('Assigns skipped records to user. Please select a user.');
      break;
    case '4':
      message = getMessage('Assigns tags that are viewable by everyone to the skipped records. Specify the required tags.');
      break;
    default:
      break;
  }

  if (message) {
    g_form.showFieldMsg('action', message, 'info');
  }
}
