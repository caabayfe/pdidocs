function onChange(control, oldValue, newValue, isLoading, isTemplate) {

      g_form.hideFieldMsg('repeat_every');

      if (g_form.getValue("run_type") === 'daily') {
        g_form.showFieldMsg("repeat_every", getMessage("This job will repeat every N days. For example, if repeat every is set to 2, the job will repeat every 2 days"), "info");
        return;
      }

      if (g_form.getValue("run_type") === 'weekly') {
        g_form.showFieldMsg("repeat_every", getMessage("This job will repeat every N weeks. For example, if repeat every is set to 2, the job will repeat every 2 weeks. The job considers Monday as the start of the week."), "info");
        return;
      }

      if (g_form.getValue("run_type") === 'monthly' || g_form.getValue("run_type") === 'week_in_month') {
        g_form.showFieldMsg("repeat_every", getMessage("This job will repeat every N months. For example, if repeat every is set to 2, the job will repeat every 2 months"), "info");
        return;
      }
   
}
