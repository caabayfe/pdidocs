function onCondition() {
    g_form.getReference('process_definition', function(ref) {
        if (ref && ref.public_access) {
            g_form.setReadOnly('enable_ai_agent', ref.public_access == 'true');
        } else {
            g_form.setReadOnly('enable_ai_agent', false);
        }
    });
}
