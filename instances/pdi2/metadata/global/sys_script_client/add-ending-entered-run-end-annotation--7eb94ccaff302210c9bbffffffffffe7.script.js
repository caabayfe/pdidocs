function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
      return;
    }

    if(newValue != ''){
      g_form.showFieldMsg("entered_run_end", getMessage("A job with the Ending field set will be deleted when Ending is reached"), "info");
    }
}
