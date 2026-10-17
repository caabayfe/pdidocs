// reset show modal flag to true for app-vsc upgrade, for all the users.
var gr = new GlideRecordSecure('sn_vsc_first_time_modal_user_preference');
gr.addQuery('show_modal', false);
gr.setValue('show_modal', true);
gr.updateMultiple();
