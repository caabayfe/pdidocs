/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    let styles = {
        "background": "rgb(var(--now-color_background--primary))"
    };

    if (api.context.props.payload.props_details.show_border) {
        styles = { ...styles,
            "border-bottom": "1px solid #D3D6DC",
            "margin": "1rem 1rem 0 1rem"
        };
    } else if (api.context.props.payload.props_details.bare === false) {
        styles = {
            ...styles,
            "border-color": "rgb(var(--now-color--neutral-3))",
            "border-style": "solid",
            "border-radius": "4px",
            "border-width": "1px",
            "box-shadow": "0px 2px 4px 0px rgb(var(--now-color--neutral-3))",
            "padding": "1rem",
            "margin-bottom": "1rem"
        }
    } else {
        styles = {
            ...styles,
            "margin": "1rem 1rem 0 1rem",
        };
    }



    return styles;
}
