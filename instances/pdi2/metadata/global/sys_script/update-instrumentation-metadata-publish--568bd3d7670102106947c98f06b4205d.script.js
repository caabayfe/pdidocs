(function executeRule(current, previous /*null when async*/) {
      if (current.workflow_state == 'published' && previous.workflow_state != 'published') {
          var kbInstrumentation = new KBInstrumentationSNC();
          var instrumentationMetadata = JSON.parse(current.getValue(kbInstrumentation.FIELD_INSTRUMENTATION_METADATA));
          if (instrumentationMetadata && instrumentationMetadata.timeTakenToPublish == null) {
              kbInstrumentation.recordGCFEvent(current, kbInstrumentation.operations.PUBLISH);
          }
      }
})(current, previous);
