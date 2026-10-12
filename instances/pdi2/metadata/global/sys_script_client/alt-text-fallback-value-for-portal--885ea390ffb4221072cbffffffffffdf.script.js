function onLoad() {
            // Check if logo_alt_text is empty, if so, set it to u_title
            if (!g_form.getValue('logo_alt_text')) {
                var titleValue = g_form.getValue('title');
                g_form.setValue('logo_alt_text', titleValue);
            }
        }
