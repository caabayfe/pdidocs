function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') return;

   var TYPE_FIELD = 'type';
   var APPLICABLE_FOR_OFFLINE_VALUE = 'offline';
   var TYPE_LOCAL_SAVE_VALUE = 'local_save';
   var TYPE_DEFAULT_VALUE = 'update';

   /*
    * The type "local_save" should be available only when applicable_for is set to "offline".
    * In a case applicable_for was changed from "offline" to another choice and type was "local_save" then the
    * type will be reset to the default "update" choice.
   */

   if (APPLICABLE_FOR_OFFLINE_VALUE == newValue) {
       g_form.addOption(TYPE_FIELD, TYPE_LOCAL_SAVE_VALUE, getMessage('Local save'));
       return;
   }

   if (TYPE_LOCAL_SAVE_VALUE == g_form.getValue(TYPE_FIELD))
      g_form.setValue(TYPE_FIELD, TYPE_DEFAULT_VALUE);

   g_form.removeOption(TYPE_FIELD, TYPE_LOCAL_SAVE_VALUE);
}
