function transform(input) {
  const plugin = "API Auth Console";
  const func = "Filter non relevant fields in sys user table for sub claim";
  let res = [];

  try {
    // calling the Script Include to get the relevant fields only
	var oAuthUserFieldChoices = new global.OAuthUserFieldChoices().process();

	for (var i = 0; i < oAuthUserFieldChoices.getSize(); i++) {
		var oAuthUserFieldChoice = oAuthUserFieldChoices.getChoice(i);
		res.push ({
			id: String(oAuthUserFieldChoice.getValue()),
			sublabel: String(oAuthUserFieldChoice.getValue()),
			label: String(oAuthUserFieldChoice.getLabel())
		});
	}

    return res;
  } catch (e) {
    gs.error(`${plugin} ${func} - ${e}`);
  }
}
