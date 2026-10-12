function onChange(control, oldValue, newValue, isLoading) {
   if (!isLoading) {
      var o_name = gel('sys_original.sys_dictionary.name');
      if (o_name.value == newValue)
          g_form.hideFieldMsg('name');
   }
}
