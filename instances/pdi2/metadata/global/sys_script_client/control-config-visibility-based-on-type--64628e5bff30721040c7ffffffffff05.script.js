function onChange(control, oldValue, newValue, isLoading, isTemplate) {
            if (isLoading || newValue === '') {
                setFieldVisibility();
                return;
            }
            setFieldVisibility();

            function setFieldVisibility() {
                var type = g_form.getValue('type');
                switch (type) {
                    case 'custom':
                        g_form.setDisplay('lit_widget', true);
                        g_form.setMandatory('lit_widget', true);
                        g_form.setDisplay('custom_element_name', true);
                        g_form.setMandatory('uri', false);
                        g_form.setDisplay('uri', false);
                        break;
                    case 'uri':
                        g_form.setMandatory('lit_widget', false);
                        g_form.setDisplay('lit_widget', false);
                        g_form.setDisplay('custom_element_name', false);
                        g_form.setDisplay('uri', true);
                        g_form.setMandatory('uri', true);
                        break;
                    default:
                        g_form.setMandatory('uri', false);
                        g_form.setMandatory('lit_widget', false);
                        g_form.setDisplay('uri', false);
                        g_form.setDisplay('lit_widget', false);
                        g_form.setDisplay('custom_element_name', false);
                }

            }
        }
