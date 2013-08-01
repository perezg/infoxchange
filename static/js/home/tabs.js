var widgets = {};
var witgedId = "";

// onDomReady
YAHOO.util.Event.onDOMReady(function () {
  // Create tabs (TabView)
  witgedId = "tabs";
  widgets[witgedId] = new YAHOO.widget.TabView(witgedId);
  widgets[witgedId].set('visible', false);
  widgets["tabs"].getTab(0).set('disabled', true);
  widgets["tabs"].getTab(1).set('disabled', true);
  widgets[witgedId].render();
});
