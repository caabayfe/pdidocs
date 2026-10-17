function script({api, event}) {  
 const {button_1} = api.item.value;
 const {button_2} = api.item.value;
 const {highlightedValues} = api.item.value;
 const {telemetryData} = api.context.props.payload;

 return {
       listItemPayload: {
           title: api.item.value.title,
           content: api.item.value.content,
           status: api.item.value.status,
           highlightedValues : highlightedValues ? highlightedValues : [],
           imageInfo : {
                imageSource: api.item.value.image_path  ? api.item.value.image_path : '',
                imageHeight: api.item.value.image_height ? api.item.value.image_height : '60',
                imageFit: api.item.value.image_fit ?  api.item.value.image_fit : 'fill',
                imagePosition: api.item.value.image_position ? api.item.value.image_position : 'center'
           },
          button1Info : {
                variant: button_1 && button_1.variant ? button_1.variant : 'primary',
                label: button_1 && button_1.label ? button_1.label : '',
                size: button_1 && button_1.size ? button_1.size : 'sm',
                toolTipText: button_1 && button_1.tool_tip_text ? button_1.tool_tip_text : '',
                icon: button_1 && button_1.icon ? button_1.icon : '',
                url: button_1 && button_1.url ? button_1.url : '',
                ariaProps : button_1 &&  button_1.aria_props ? button_1.aria_props : {}
          },
         button2Info : {
                variant: button_2 && button_2.variant ? button_2.variant : 'primary',
                label: button_2 && button_2.label ? button_2.label : '',
                size: button_2 && button_2.size ? button_2.size : 'sm',
                toolTipText: button_2 && button_2.tool_tip_text ? button_2.tool_tip_text : '',
                icon: button_2 && button_2.icon ? button_2.icon : '',
                url: button_2 && button_2.url ? button_2.url : '',
                ariaProps : button_2 &&  button_2.aria_props ? button_2.aria_props : {}
         },
        additionalData : api.item.value.additional_data ? api.item.value.additional_data  : {}
       },
       telemetryData : telemetryData,
       buttonsDisplay: api.context.props.payload.props_details.button_display_style,
       button1eventName: api.context.props.payload.props_details.button1_event_name,
       button2eventName: api.context.props.payload.props_details.button2_event_name
    };
}
