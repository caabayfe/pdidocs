function onChange(control, oldValue, newValue, isLoading, isTemplate) {

      g_form.hideFieldMsg('repeat_every');

      if (g_form.getValue("trigger_type") === '11') {
        g_form.showFieldMsg("repeat_every", getMessage("This job will repeat every N days. For example, if repeat every is set to 2, the job will repeat every 2 days"), "info");
        return;
      }

      if (g_form.getValue("trigger_type") === '3') {
        g_form.showFieldMsg("repeat_every", getMessage("This job will repeat every N weeks. For example, if repeat every is set to 2, the job will repeat every 2 weeks. The job considers Monday as the start of the week."), "info");
        return;
      }

      if (g_form.getValue("trigger_type") === '4' || g_form.getValue("trigger_type") === '5') {
        g_form.showFieldMsg("repeat_every", getMessage("This job will repeat every N months. For example, if repeat every is set to 2, the job will repeat every 2 months"), "info");
        return;
      }
   
}
