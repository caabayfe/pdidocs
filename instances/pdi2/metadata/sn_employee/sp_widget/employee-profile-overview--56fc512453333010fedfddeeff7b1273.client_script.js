api.controller = function(cabrillo, $rootScope, $scope, $timeout) {
    /* widget controller */
    var c = this;
    $scope.currentField = null;
    var quill;
    var bindings = {
      bold: {
        key: 'B',
        metaKey: true,
        handler: function(range, context) {
          // Handle ctrl+b
          //empty handlers, so that the actuall handlers dont trigger.
        }
      },
      italic: {
        key: 'I',
        metaKey: true,
        handler: function(range, context) {
          // Handle ctrl+i
        }
      },
      underline: {
        key: 'U',
        metaKey: true,
        handler: function(range, context) {
          // Handle ctrl+u
        }
      },
      list: {
        key: 'backspace',
        format: ['list'],
        handler: function(range, context) {
          if (context.offset === 0) {
            // When backspace on the first character of a list,
            // remove the list instead
            this.quill.format('list', false, Quill.sources.USER);
          } else {
            // Otherwise propogate to Quill's default
            return true;
          }
        }
      }
    };
    c.data.isMobile = cabrillo.isNative();
    if (c.data.isMobile) {
        cabrillo.viewLayout.setTitle(c.data.messages.mobileHeader);
    }
    c.loadSections = function() {

        if (!c.data.sections || c.data.sections.length == 0)
            return;

        var collapsibleSection = c.data.sections[0];
        c.collapsibleSectionCount = 0;
        for (var i = 0; i < c.data.sections.length; i++) {
            var section = c.data.sections[i];
            section.isCollapsible = !section.hideSectionName;
            if (section.isCollapsible)
                c.collapsibleSectionCount++;
            section.showExpanded = c.data.expandAllSections == "true" ? true : false;
            section.endSection = false;
            //Put divider between the sections with visible section names
            if (i == c.data.sections.length - 1 || !c.data.sections[i + 1].hideSectionName)
                section.endSection = true;
            if (section.isCollapsible) {
                //First section along with its subsections are expanded. Rest all are collapsed
                if (i == 0)
                    section.showExpanded = true;
                collapsibleSection = section;
            } else {
                section.showExpanded = (i === 0) ? true : c.data.sections[i - 1].showExpanded;
                //To expand/collapse all the child sections (hideSectionName=true) under the parent section (hideSectionName=false) when pressed chevron icon.
                //The parent section will store the reference to child sections.
                if (!collapsibleSection.subsections)
                    collapsibleSection.subsections = [];
                collapsibleSection.subsections.push(section);
            }
            if (c.data.disableLinks == "false") {
                section.fields.forEach(function(field) {
                    c.createFieldRenderer(field);
                });
            }
            if (cabrillo.isNative())
                section.showExpanded = true;
        }
    };

  c.createFieldRenderer = function(field) {
    switch (field.fieldType) {
      case 'phone_number_e164' :
        field.tag = "tel:" + field.fieldValue;
        break;
      case 'phone_number' :
        field.tag = "tel:" + field.fieldValue;
        break;
      case 'ph_number' :
        field.tag = "tel:" + field.fieldValue;
        break;
      case 'email' :
        field.tag = "mailto:" + field.fieldValue;
        break;
      case 'url' :
        field.tag = field.fieldValue;
        field.target = "_blank";
        break;
      case 'reference' :
        var fieldName = field.fieldName;
        if(fieldName === 'manager' || fieldName === 'user.manager') {
          var url = field.fieldInternalValue ? '?id=employee_profile&sys_id=' + field.fieldInternalValue : '';
          field.tag = url;
        }
        break;
      default:
        break;
    }
  };

    c.toggleSectionView = function(section) {
        section.showExpanded = !section.showExpanded;
        if (section.subsections) {
            section.subsections.forEach(function(subsection) {
                subsection.showExpanded = section.showExpanded;
            });
        }
    };
    c.editField = function(field) {
        $('[data-toggle=tooltip]').tooltip("hide");
        field.isEditing = true;
        $scope.currentField = field;
        c.focusField(field);
        if(field.fieldName == 'short_bio') {
          c.quillFormatting(field);
        }
    };

    c.quillFormatting = function(field) {
      if(!quill) {
        quill = new Quill('.quill-editor', {
          modules: {
              toolbar: false,
            keyboard: {
              bindings: bindings
            }
          }
        });
        //remove the tab binding for accessibility control;
        delete quill.getModule('keyboard').bindings["9"];
        quill.root.ariaLabel = "Enter value for " + field.fieldLabel;
        quill.root.role = "textbox";
        quill.clipboard.container.ariaHidden = "true";
        quill.clipboard.addMatcher(Node.ELEMENT_NODE, function(node, delta) {
          var ops = []
          delta.ops.forEach(function(op) {
            if (op.insert && typeof op.insert === 'string') {
              ops.push({
                insert: op.insert
              })
            }
          })
          delta.ops = ops
          return delta
        });
        quill.on('text-change', c.validateQuill);
      }
    };

    c.validateQuill = function(delta, oldDelta, source) {
      var textData = quill.getText().replace(/\n$/g, '');
      $scope.$applyAsync(function() {
        $scope.currentField.data = textData;
      });
      quill.formatText(0, $scope.currentField.maxlength, {
          'background-color' : '#FFFFFF'
        });
      if(textData.length + 1 > $scope.currentField.maxlength) {
        quill.formatText($scope.currentField.maxlength, textData.length - $scope.currentField.maxlength + 1, {
          'background-color' : '#FFCCD2'
        });
      }
    };

    c.saveField = function(field) {
        var input = {};
        field.isEditing = false;
        if ((field.fieldType === 'string' || field.fieldType === 'textarea') && field.data.trim() != field.fieldValue) {
            input.fieldValue = field.data.trim();
            field.fieldValue = input.fieldValue;
        }
        if (field.fieldType === 'choice' && field.data.label != field.fieldValue) {
            input.fieldValue = field.data.value;
            if (input.fieldValue)
                field.fieldValue = field.data.label;
            else
                field.fieldValue = null;
            //broadcast the value to header widget
            if (field.fieldName === 'preferred_pronoun') {
                $rootScope.$broadcast('sn_employee.preferredPronoun', field.fieldValue);
            }
            // logic to fetch the updated index of choice list
            var matchedIndex;
            for (var choiceVar = 0; choiceVar < field.options.length; choiceVar++) {
                if (field.options[choiceVar].label === field.fieldValue)
                    matchedIndex = choiceVar;
            }
            field.choiceIndex = matchedIndex ? matchedIndex : 0;
        }

        if (field.hasOwnProperty('isPublic') && field.inputVisibility != field.isPublic) {
            input.isPublic = field.inputVisibility;
            field.isPublic = field.inputVisibility;
        }

        if (input.hasOwnProperty('fieldValue') || input.hasOwnProperty('isPublic')) {
            c.server.get({
                action: 'updateField',
                fieldName: field.fieldName,
                data: input
            });
        }
      if(field.fieldName == "short_bio") {
        if(quill) {
          quill.setText(field.fieldValue);
        }
      }
        c.focusField(field);
    };

    c.cancelEdit = function(field) {
        field.isEditing = false;
        c.focusField(field);
      if(field.fieldName == "short_bio") {
        $scope.currentField.data = field.fieldValue;
        if(quill) {
          quill.setText(field.fieldValue);
        }
      }
    };

    c.focusField = function(field) {
        $timeout(function() {
            var elementToFocus = null;
            if (field.isEditing) {
                var inputFieldSelector = "#field_input_" + field.sysId;
                if (field.fieldType === 'string') {
                    elementToFocus = $(inputFieldSelector + ' input');
                    var dataSize = elementToFocus[0].value.length;
                    //Place the cursor at the end of text in the input (Safari issue)
                    elementToFocus[0].selectionStart = elementToFocus[0].selectionEnd = dataSize;
                }
                else if (field.fieldType === 'textarea') {
                  if(field.fieldName == 'short_bio') {
                    if(quill) {
                      quill.setSelection(quill.getText().length);
                    }
                  }
                  else {
                    elementToFocus = $(inputFieldSelector + ' textarea');
                    var dataSize = elementToFocus[0].value.length;
                    //Place the cursor at the end of text in the input (Safari issue)
                    elementToFocus[0].selectionStart = elementToFocus[0].selectionEnd = dataSize;
                  }
                }
                else if (field.fieldType === 'choice')
                  elementToFocus = $(inputFieldSelector + ' select');
            } else {
                if (!field.fieldValue)
                    elementToFocus = $("#field_add_value_" + field.sysId);
            }

            if (elementToFocus && elementToFocus.length > 0)
                elementToFocus.focus();
        }, 0, false);
    };

    c.updateFieldVisibility = function(field) {
        if (!field.data.value)
            field.inputVisibility = false;
    };

    /* ===== INIT ==== */
    c.loadSections();
};
