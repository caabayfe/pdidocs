/**
 * Triggered on initial and changed input of nodes/edges.
 * Synchronizes loading and empty states.
 * Invokes RECOMPUTE_EXPANDED logic (debounced).
 */
function handler({api, helpers, event}) {
  const {
	setTimeout,
	clearTimeout
	} = helpers?.timing;

  const {debounceExpand} = api.state;
  const DEBOUNCE_TIME = 200;
  const {payload} = event;
  const executeNow = payload?.executeNow || false;

  if (executeNow){
      clearTimeout(debounceExpand);
      api.setState('executeNow', true); 
      api.emit('SN_NODE_MAP_UNIFIED_CTRL#RECOMPUTE_EXPANDED', {});
      return;
  }

	api.setState('debounceExpand', ({currentValue: debounceExpand, api}) => {
		//Check if a timer for the current event name already exist
		//Then reset the time and debounce again
		if (debounceExpand)
      clearTimeout(debounceExpand);

		//Start debounce
		const newTimer = setTimeout(() => {
			api.emit('SN_NODE_MAP_UNIFIED_CTRL#RECOMPUTE_EXPANDED', {});
 			api.setState('debonceExpand', null); //			api.setState('debonceExpand', null); //reset debounce state
		}, DEBOUNCE_TIME);

		return newTimer;
	});
}
