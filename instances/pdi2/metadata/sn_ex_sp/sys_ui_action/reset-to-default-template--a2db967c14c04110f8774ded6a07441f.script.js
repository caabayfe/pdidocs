function onConfirm(){
      gsftSubmit(null, g_form.getFormElement(), 'reset_to_default_template');
    }

    function reset_to_default() {
      var gm = new GlideModal('sn_ex_sp_reset_to_default_template_dialog');
      gm.setTitle(getMessage('Reset to default template'));
      // passing handler function which will be called on clicking OK
      gm.setPreference('sysparm_handler',onConfirm);
      gm.render();
    }

    //function called during server side execution
    if (typeof window == 'undefined')
      updateTopic();

    function updateTopic() {
      var defaultTemplate = '4fb26c9cc3d030102ec1a589a840ddbd';
      current.template = defaultTemplate;
      current.update();
      action.setRedirectURL(current);
}
