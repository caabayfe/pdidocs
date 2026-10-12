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
          header_font_src,
          header_font_name
        }
    } = api.state;
    const listItems = [...fontAssetListItems];
    if (header_font_src && header_font_name) {
      listItems.push({
        id: header_font_src,
        label: header_font_name
      });
    }
    return listItems;
}
