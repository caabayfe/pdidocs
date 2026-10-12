function transform(input) {
    try {
      return NAAPluginUtil.isPluginInstalled('sn_convo_studio');
    } catch (error) {
      gs.error("Error occurred in fetching sn_convo_studio plugin detail  :"+error.toString());
      return false;
    }
}
