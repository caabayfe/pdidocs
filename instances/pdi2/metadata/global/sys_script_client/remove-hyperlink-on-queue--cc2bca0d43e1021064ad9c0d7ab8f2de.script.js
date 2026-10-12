function onLoad() {
   if(g_scratchpad.processing_framework_feature == 'false') {
		var queueHTML = g_form.getLabel('queue');
		queueHTML.outerHTML = '<label onclick="return labelClicked(this);" for="sysevent_register.queue" dir="ltr" class=" col-xs-12 col-md-3 col-lg-4 control-label"><span id="status.sysevent_register.queue" aria-label="" data-dynamic-title="" mandatory="true" oclass="" class=" label_description"></span><span title="" class="label-text" data-html="false">Queue</span></label>';
   }

   
}
