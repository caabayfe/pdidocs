changeSLAEngineVersionOption();

function changeSLAEngineVersionOption() {
   if (current.value != '2010' && current.value != '2011')
      // no change, if to invalid value
      current.value = previous.value;
}
