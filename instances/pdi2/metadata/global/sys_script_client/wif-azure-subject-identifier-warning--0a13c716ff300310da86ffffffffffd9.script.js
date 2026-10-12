function onLoad() {
    var warningMsg = getMessage('Must exactly match the Subject in your Azure federated credential. A mismatch will cause silent authentication failure.');
    g_form.showFieldMsg('subject_identifier', warningMsg, 'warning');
}
