var step = new GlideRecord('sys_atf_step');

// Get all "Run Server Side Script" steps
step.addQuery('step_config', '41de4a935332120028bc29cac2dc349a');
step.query();

// Loop through RSSS steps
while (step.next()) {
  var stepID = step.getUniqueValue();

  // Check the 'jasmine_version' input variable for this test step
  var variable = new GlideRecord('sys_variable_value');
  variable.addQuery('document_key', stepID);
  variable.addQuery('variable', '42f2564b73031300440211d8faf6a777');
  variable.query();

  // Only update this variable if it doesn't currently have a value set
  if (!variable.next()) {
    step.inputs.jasmine_version = '1.3';
    if (step.update() !== null)
      gs.info('Set Jasmine version for step ' + stepID + ' to ' +  step.inputs.jasmine_version);
    else
      gs.warn('Failed to update Jasmine version for step ' + stepID);
  } else {
    gs.info('Jasmine version for step ' + stepID + ' already set to ' + step.inputs.jasmine_version + ', no change made');
  }
}
