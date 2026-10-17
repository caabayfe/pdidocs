/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        margin,
        padding,
        background_color,
        all_borders,
        border,
        border_right,
        display,
        gap,
        align,
        justify,
        flex_direction,
        column_template,
        row_template
    } = api.context.props.payload.props_details;

    const flexVars = display === 'flex' ? {
        '--sn-ace-container-flex-direction': flex_direction,
        '--sn-ace-container-flex-gap': gap,
        '--sn-ace-container-flex-align': align,
        '--sn-ace-container-flex-justify': justify,
    } : {};


    const gridVars = display === 'grid' ? {
        '--sn-ace-container-grid-gap': gap,
        '--sn-ace-container-grid-row-template': row_template,
        '--sn-ace-container-grid-column-template': column_template
    } : {};

    const SAME_AS_ALL_BORDERS_DEFAULT_VALUE = 'Same as all borders';

    const borderVars = {
        '--sn-ace-container-border': all_borders,
        '--sn-ace-container-border-bottom': border === SAME_AS_ALL_BORDERS_DEFAULT_VALUE ? all_borders : border,
        '--sn-ace-container-border-right': border_right === SAME_AS_ALL_BORDERS_DEFAULT_VALUE ? all_borders : border_right,
    };


    return {
        '--sn-ace-container-margin': margin,
        '--sn-ace-container-padding': padding,
        '--sn-ace-container-background-color': background_color,
        ...borderVars,
        '--sn-ace-container-display': display,
        ...flexVars,
        ...gridVars
    };
}
