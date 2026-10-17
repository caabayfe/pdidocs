function script({api, event}) {
     var profileUrl = api.context.props.profileUrl;
    return [{
            "label": api.state.translations.breadcrumbs.profile,
            "href": decodeURIComponent(profileUrl),
            "hideLabel": true
        },
        {
            "label": api.state.translations.breadcrumbs.identity_center,
            "href": "/now/identity-center/home"
        }
    ];
    }
