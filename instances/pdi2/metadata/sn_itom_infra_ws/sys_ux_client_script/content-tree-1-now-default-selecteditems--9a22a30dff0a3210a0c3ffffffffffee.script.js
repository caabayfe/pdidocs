/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const sel = api.state.contentTreeSelectedItem;

  // Case 1: already an array of paths (e.g. [['p2','mid_issues']])
  if (Array.isArray(sel) && sel.every(x => Array.isArray(x))) {
    return sel;
  }

  // Case 2: a single path array (e.g. ['p2','mid_issues'] or ['overview'])
  if (Array.isArray(sel)) {
    return sel.length ? [sel] : [];  // [] means "nothing selected"
  }

  // Case 3: a single id string
  if (typeof sel === 'string' && sel) {
    return [[sel]];
  }
}
