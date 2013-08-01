// Left Menu
YAHOO.util.Event.onDOMReady(function() {
  var myMenu = new YAHOO.widget.Menu("navmenu", { position:"static" });
  myMenu.render();
});

function loadHTTPRequestExamples() {
  witgedId = "tabs";
  
  //YAHOO.util.Dom.removeClass(witgedId, "yui-pe");
  widgets[witgedId].set('visible', true);
  widgets[witgedId].getTab(0).set('disabled', false);
  widgets[witgedId].getTab(1).set('disabled', true);
  
  widgets[witgedId].set('activeIndex', 0);
}

function loadDataTableExample() {
  witgedId = "tabs";
  
  //YAHOO.util.Dom.removeClass(witgedId, "yui-pe");
  widgets[witgedId].set('visible', true);
  widgets[witgedId].getTab(0).set('disabled', true);
  widgets[witgedId].getTab(1).set('disabled', false);
  
  widgets[witgedId].set('activeIndex', 1);
  
  loadDataTable();
}
// End left menu