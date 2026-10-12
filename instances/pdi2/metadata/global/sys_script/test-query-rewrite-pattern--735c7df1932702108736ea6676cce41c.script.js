
			
            function onBefore(current, previous) {
                var successful = QueryPatternRewriteTest.runTest(current);
                if (!successful) {
                    current.active = false;
                    current.setAbortAction(true);
                }
            }
