function onLoad() {
    // hide the theme initially
    g_form.setDisplay("theme", false);

    var gr = new GlideRecord("m2m_app_theme");
    gr.addQuery("ux_app", g_form.getUniqueValue());
    gr.query();

    // show the theme if needed
    g_form.setDisplay("theme", gr.hasNext() ? false : true);
}
