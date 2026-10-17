function onCondition() {
    var field = 'template';
    var message = getMessage('This template has additional data such as template condition, field condition, email, variable picker etc. and can only be modified using “Template Advanced formatter”');
    g_form.showFieldMsg(field, message);
}
