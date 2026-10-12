function getSysProperty(name){
	var grProp = new GlideRecord('sys_properties');
	grProp.addQuery('name', name);
	grProp.query();
	if(grProp.next()){
		return grProp.getValue('value');
	}
	return null;
}

var header_label = getSysProperty('com.glide.cs.branding.header_label');
var va_logo = getSysProperty('com.glide.cs.branding.va_logo');
var header_bg_color = getSysProperty('com.glide.cs.branding.header_bg_color');
var header_font_color = getSysProperty('com.glide.cs.branding.header_font_color');
var bg_color = getSysProperty('com.glide.cs.branding.bg_color');
var input_bg_color = getSysProperty('com.glide.cs.branding.input_bg_color');
var menu_icon_color = getSysProperty('com.glide.cs.branding.menu_icon_color');

var bubble_bg_color = getSysProperty('com.glide.cs.branding.bubble_bg_color');
var bubble_font_color = getSysProperty('com.glide.cs.branding.bubble_font_color');
var agent_bubble_bg_color = getSysProperty('com.glide.cs.branding.agent_bubble_bg_color');
var agent_bubble_font_color = getSysProperty('com.glide.cs.branding.agent_bubble_font_color');
var bot_bubble_bg_color = getSysProperty('com.glide.cs.branding.bot_bubble_bg_color');
var bot_bubble_font_color = getSysProperty('com.glide.cs.branding.bot_bubble_font_color');
var link_color = getSysProperty('com.glide.cs.branding.link_color');
var disabled_link_color = getSysProperty('com.glide.cs.branding.disabled_link_color');
var button_bg_color = getSysProperty('com.glide.cs.branding.button_bg_color');
var va_profile = getSysProperty('com.glide.cs.branding.va_profile');

var system_message_color = getSysProperty('com.glide.cs.branding.system_message_color');
var category_bg_color = getSysProperty('com.glide.cs.branding.category_bg_color');
var category_font_color = getSysProperty('com.glide.cs.branding.category_font_color');
var timestamp_color = getSysProperty('com.glide.cs.branding.timestamp_color');
var seperator_color = getSysProperty('name','com.glide.cs.branding.seperator_color');
var msg_delay = getSysProperty('com.glide.cs.branding.msg_delay');
var type_presence_delay = getSysProperty('com.glide.cs.branding.type_presence_delay');
var load_animation_color = getSysProperty('com.glide.cs.branding.load_animation_color');

var support_phone_label = getSysProperty('com.glide.cs.branding.support_phone_label');
var support_phone = getSysProperty('com.glide.cs.branding.support_phone');
var support_hours_label = getSysProperty('com.glide.cs.branding.support_hours_label');
var support_email_label = getSysProperty('com.glide.cs.branding.support_email_label');
var support_email = getSysProperty('com.glide.cs.branding.support_email');

var contact_live_agent = support_hours_label ? true : false;
var send_email = support_email_label ? true : false;
var phone_call = support_phone_label ? true : false;

var gr = new GlideRecord('sys_cs_branding_setup');
gr.addQuery('branding_key','default_branding');
gr.query();
if(gr.next()) {
	if(va_logo){
		//Sys_property has image stored with .iix extension
		va_logo = va_logo.substring(0,va_logo.indexOf('.'));
		var sys_att = new GlideRecord('sys_attachment');
		sys_att.get(va_logo);
		sys_att.setValue('table_name', 'ZZ_YYsys_cs_branding_setup');
		sys_att.setValue('table_sys_id',gr.getUniqueValue());
		sys_att.update();
	}

	gr.setValue('header_label',header_label);
	gr.setValue('va_logo',va_logo);
	gr.setValue('header_font_color',header_font_color);
	gr.setValue('bg_color',bg_color);
	gr.setValue('input_bg_color',input_bg_color);
	gr.setValue('menu_icon_color', menu_icon_color);

	gr.setValue('bubble_bg_color',bubble_bg_color);
	gr.setValue('bubble_font_color',bubble_font_color);
	gr.setValue('agent_bubble_bg_color',agent_bubble_bg_color);
	gr.setValue('agent_bubble_font_color',agent_bubble_font_color);
	gr.setValue('bot_bubble_bg_color',bot_bubble_bg_color);
	gr.setValue('bot_bubble_font_color',bot_bubble_font_color);
	gr.setValue('link_color',link_color);
	gr.setValue('disabled_link_color',disabled_link_color);
	gr.setValue('button_bg_color',button_bg_color);
	gr.setValue('va_profile',va_profile);

	if(system_message_color == '#7f8e9f') {
		gr.setValue('system_message_color','#666666');
	} else {
		gr.setValue('system_message_color',system_message_color);
	}
	
	if (header_bg_color == '#68A1AF')
		gr.setValue('header_bg_color','#4E7D88');
	else
		gr.setValue('header_bg_color', header_bg_color);
	
	gr.setValue('category_bg_color',category_bg_color);
	gr.setValue('category_font_color',category_font_color);
	gr.setValue('timestamp_color',timestamp_color);
	gr.setValue('seperator_color',seperator_color);
	gr.setValue('msg_delay',msg_delay);
	gr.setValue('type_presence_delay',type_presence_delay);
	gr.setValue('load_animation_color',load_animation_color);

	gr.setValue('support_phone_label',support_phone_label);
	gr.setValue('support_phone',support_phone);
	gr.setValue('support_hours_label',support_hours_label);
	gr.setValue('support_email_label',support_email_label);
	gr.setValue('support_email',support_email);

	gr.setValue('contact_live_agent',contact_live_agent);
	gr.setValue('send_email',send_email);
	gr.setValue('phone_call',phone_call);
	gr.update();
}
