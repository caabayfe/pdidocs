(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

   var returnObj = {
		useAnimatedAvatar: gs.getProperty('sn_nowassist_va.nass_animated_avatar_enabled') === 'true',
		focusOnInputTextBox: gs.getProperty('sn_va_web_client.focus_on_input_text_box') === 'true',
		showEndFlowButton: gs.getProperty('sn_nowassist_va.nass_show_end_flow_button') === 'true',
		textShortenResponseDisabled: gs.getProperty('com.glide.cs.text.shorten_response.disabled') === 'true',
    shortenResponseDisabled: gs.getProperty('sn_nowassist_va.synthesized_response.shorten_response.disabled') === 'true',
		hideDisabledSRPopover: gs.getProperty('com.glide.cs.nass.synthesized_response.disabled_popover.hide') === 'true',
		oneClickSRCitationAction: gs.getProperty('com.glide.cs.nass.synthesized_response.citation_action.one_click') === 'true',
		enableEmojiPanel: gs.getProperty('com.glide.cs.nlu_enable_emoji_panel') === 'true',
		showUploadMsg: gs.getProperty('com.glide.cs.general.multi_file_size_exceed_msg')
   };
   return returnObj;

})(request, response);
