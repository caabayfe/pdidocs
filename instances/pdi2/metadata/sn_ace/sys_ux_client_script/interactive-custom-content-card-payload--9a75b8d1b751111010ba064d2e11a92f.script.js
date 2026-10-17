function script({api, event}) {  
    const {telemetryData} = api.context.props.payload;

    return {
        parent_block_id: api.context.props.payload.block_id,
        
        props_details: {
            interaction: api.item.value.interaction,
            interaction_payload: api.item.value.interaction_payload,
            highlighted_label: api.item.value.highlighted_label,
            highlighted_variant: api.item.value.highlighted_variant,
            highlighted_color: api.item.value.highlighted_color,
            highlighted_icon: api.item.value.highlighted_icon,
            image: api.item.value.image,
            title: api.item.value.title,
            title_icon: api.item.value.title_icon,
            subtitle: api.item.value.subtitle,
            subtitle_icon: api.item.value.subtitle_icon,
            body: api.item.value.body,
            button_type: api.item.value.button_type,
            button_text: api.item.value.button_text,
            button_tooltip_label: api.item.value.button_tooltip_label,
            button_action_type: api.item.value.button_action_type,
            button_action_payload: api.item.value.button_action_payload,
            aria_properties: api.item.value.aria_properties,
            alt: api.item.value.alt
            
	},
        telemetryData : telemetryData
    };
}
