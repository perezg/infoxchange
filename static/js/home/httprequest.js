// onDomReady
YAHOO.util.Event.onDOMReady(function () {
  // Error dialog
  witgedId = "error-dialog";
  
  // Remove progressively enhanced content class, just before creating the module 
  YAHOO.util.Dom.removeClass(witgedId, "yui-pe");
  
  // Instantiate the Dialog
  widgets[witgedId] = new YAHOO.widget.SimpleDialog(witgedId, { 
    width: "400px",
    fixedcenter: true,
    visible: false,
    draggable: true,
    close: true,
    text: "Dialog text",
    icon: YAHOO.widget.SimpleDialog.ICON_ALARM,
    constraintoviewport: true,
    buttons: [ { text:"OK", handler:handleOK, isDefault:true } ]
  } );
  widgets[witgedId].render();
});

YAHOO.util.Event.onContentReady("btnGetCategories", function () {
  // Create GetCategories button
  witgedId = "btnGetCategories";
  widgets[witgedId] = new YAHOO.widget.Button(witgedId, {
      checked: false, // Attribute override 
      label: "Get Categories"
  });
  widgets[witgedId].on("click", getCategories);
  
  // Create RequestError button
  witgedId = "btnRequestError";
  widgets[witgedId] = new YAHOO.widget.Button(witgedId, {
      checked: false, // Attribute override 
      label: "Test request error"
  });
  widgets[witgedId].on("click", getRequestError);
});

//////////////////////////////////////////////
var handleOK = function () {
    this.hide();
}

var handleFailure = function(o){
  var content = "<p>An error ocurred when trying to read: <br/>" +  o.argument.url + "</p>";
  content += "<ul><li>Transaction id: " + o.tId + "</li>";
  content += "<li>HTTP status: " + o.status + "</li>";
  content += "<li>Status code message: " + o.statusText + "</li></ul>";

  // Display dialog
  widgetId = "error-dialog";
  widgets[widgetId].setBody(content);
  widgets[widgetId].show();
}


function getCategories() {
  var sUrl = "/infoxchange/api/v1/categories/?format=json";
  var transaction = YAHOO.util.Connect.asyncRequest('GET', sUrl, {
    success: listCategories,
    failure: handleFailure,
    argument: { url: sUrl }
  }, null);
}

function getRequestError() {
  var sUrl = "/error";
  var transaction = YAHOO.util.Connect.asyncRequest('GET', sUrl, {
    success: listCategories,
    failure: handleFailure,
    argument: { url: sUrl }
  }, null);
}


function listCategories(response) {
  
  widgetId = 'xhr-content';
  YAHOO.util.Dom.removeClass(witgedId, "yui-pe");
  
  // Use jQuery to set html content
  $('#' + widgetId).html('<p>' + response.responseText + '</p>');
  
}