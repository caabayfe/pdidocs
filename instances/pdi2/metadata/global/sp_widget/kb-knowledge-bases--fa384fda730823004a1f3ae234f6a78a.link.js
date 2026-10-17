  function(scope, elem) {

		setTimeout(function() {
			var focusser = elem.find('.select2-focusser');
			var searchInput = elem.find('.select2-input');
			if (focusser.length) {
				focusser.removeAttr('aria-labelledby');
				focusser.attr('aria-label', scope.data.kbAriaLabel);
			}
			if (searchInput.length)
				searchInput.attr('aria-label', scope.data.kbAriaLabel);
		}, 50);

      function isSelect2HomeEndButtons(event) {
        return event.which === 35 || event.which === 36;
      }

      function handleSelect2HomeEndButtons(event) {
        if (!isSelect2HomeEndButtons(event))
          return;

        event.preventDefault();
        var selectEle = $('ul.select2-results li');
        var selectId;

        if (selectEle.length > 0) {
          selectEle.removeClass('select2-highlighted');
          var targetElement;

          if (event.which === 36) {
            targetElement = selectEle.first();
          } else {
            targetElement = selectEle.last();
          }

          targetElement.addClass('select2-highlighted');
          targetElement[0].scrollIntoView();
          var targetDiv = targetElement.find('div');
          selectId = targetDiv.attr('id');
          $('#select2-drop .select2-input').attr('aria-activedescendant', selectId);
        }
      }

        elem.on('keydown', '.select2-focusser', function(event) {
        //handling Up, Down Arrows and Home, End Buttons functionality
          if (event.which === 40 || event.which === 38 || event.which === 36 || event.which === 35) {
            $('#kbSelect').select2('open');
            event.preventDefault();
          if (isSelect2HomeEndButtons(event)) {
            setTimeout(function() {
              handleSelect2HomeEndButtons(event);
            }, 500);
          }
          }
        });

      $(document).on('keydown', '.select2-drop', function(event){
        handleSelect2HomeEndButtons(event);
      });
      }
