changeSLAEngineVersionOption();

function changeSLAEngineVersionOption() {
   if (current.value == '2010')
      SLAEngineChange.switchTo2010();
   else if (current.value == '2011' && SLAEngineChange.checkSLAcalc2011())
      SLAEngineChange.switchTo2011();
}
