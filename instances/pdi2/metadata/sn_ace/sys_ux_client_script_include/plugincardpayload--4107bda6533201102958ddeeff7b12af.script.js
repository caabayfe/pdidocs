function include({
    imports
}) {

        const pluginCardPayload = (payload) => {
        const {
            button_label,
            aria_properties,
            post_action_tooltip,
            action,
            variant,
            size,
            icon,
            configure_demo_data,
            entitlement_link,
            plugin_home_url,
            post_action_label,
            plugins,
            plugin_name,
            plugin_details,
            action_aria_label,
            action_tooltip
        } = payload.props_details;

        const formattedPayload = {
            buttonLabel: button_label,
            mode: action,
            plugins: plugins,
            variant: variant,
            size: size,
            icon: icon,
            configureDemoData: configure_demo_data,
            entitlementLink: entitlement_link,
            postActionLink: plugin_home_url,
            postActionLabel: post_action_label,
            pluginName: plugin_name,
            pluginDetails: plugin_details,
            actionAriaLabel: {"aria-label":action_aria_label},
            actionTooltip: action_tooltip,
           ariaProperties: aria_properties,
           postActionTooltip: post_action_tooltip
        };
        return formattedPayload;
    };
return {
    pluginCardPayload
};
}
