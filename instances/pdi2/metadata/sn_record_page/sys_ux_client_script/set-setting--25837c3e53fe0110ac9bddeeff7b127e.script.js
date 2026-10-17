function script({api, event}) {
	const {name, value} = event.payload;

    if (name === 'isSideBySideViewEnabled') {
      const enable = !!value;
      api.setState('isSideBySideEnabled',  enable, false);
      api.setState('activityStreamLayout', enable ? '' : 'stacked');
    }
    if (name === 'isRichTextEnabled') {
      api.setState('isHTMLEditorEnabled', !!value);
    }
}
