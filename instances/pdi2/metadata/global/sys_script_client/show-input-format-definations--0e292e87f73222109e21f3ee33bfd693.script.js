function onLoad() {
    //If input format has value, toggle off mandatory configuration for guidance_text
    if (g_form.getValue('input_format')) {
        g_form.setMandatory('guidance_text', false);
    }

}
