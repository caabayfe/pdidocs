// eslint-disable-next-line no-unused-vars
    function resizablePolicy({
      api,
      properties
      }) {
      api.updateVisibility('resizableMinHeight', properties.enableResizable);
      api.updateVisibility('resizableMinWidth', properties.enableResizable);
      api.updateVisibility('resizableMaxHeight', properties.enableResizable);
      api.updateVisibility('resizableMaxWidth', properties.enableResizable);
    }
