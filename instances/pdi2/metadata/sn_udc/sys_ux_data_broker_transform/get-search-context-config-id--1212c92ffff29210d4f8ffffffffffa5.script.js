function transform(input) {
  if (!input || !input.zingSearchContextId || !input.aisSearchContextId) return '';
  var isAISEnabled = JSON.parse(gs.getProperty('glide.ais.enabled')) || false;
  if(isAISEnabled)
    return input.aisSearchContextId;
  return input.zingSearchContextId;
}
