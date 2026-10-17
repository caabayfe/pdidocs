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
        fontAssetListItems,
        urlBasedFontData: {
          body_font_src,
          body_font_name
        }
    } = api.state;
    const listItems = [...fontAssetListItems];
    if (body_font_src && body_font_name) {
      listItems.push({
        id: body_font_src,
        label: body_font_name
      });
    }
    return listItems;
}
