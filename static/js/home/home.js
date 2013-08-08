var myHomePage = (function () {
  
  var //
  _tabviews = {},
  _dataTables = {},
  _widgets = {},
  _modelSchema = {},
  _schemaLoadedEvents = {},
  _columnDefs = null,
  _apiUrl = "/infoxchange/api/v1/";
  ;
  
  _init();
  
  YAHOO.util.Event.onDOMReady(_initDOM);
  
  
  /*
   * Initializes everything that doesn't depend on the DOM
   * @method _init
   */
  function _init() {
    _getAPISchema();
    _defineColumnsAttr();
  }
  
  /*
   * This function is called when the DOM is ready
   * @method _initDOM
   */
  function _initDOM() {
    _initLayout();
    
    onSchemaLoaded("all", _addResourceToMenu, []);
  }
  
  
  /*
   * Allows to register callbacks functions to be executed when the schema resource
   * has finished to load
   * @method onSchemaLoaded
   * @param {String} resourceName Name of the resource in the API
   * 		     use "all" in case of register the function for all the schemaLoaded events
   * @param {Function} registeredFunction Pointer to the callback function
   * @param {Array} parameters Array containing the parameters to be passed to the
   *                           callback function
   */
  function onSchemaLoaded(resourceName, registeredFunction, parameters) {
    if(typeof(_schemaLoadedEvents[resourceName]) == "undefined") {
      _schemaLoadedEvents[resourceName] = [];
    }
    
    if(typeof(parameters) == "undefined") {
      parameters = [];
    }
    
    _schemaLoadedEvents[resourceName].push({
      func: registeredFunction,
      params: parameters
    });
  }
  
  /*
   * Executes all the callback functions registered for execution
   * on load of the specified resource in the schema
   * @method _schemaLoaded
   * @param {String} resourceName Name of the resource in the API
   */
  function _schemaLoaded(resourceName) {
    var allEvents = _schemaLoadedEvents["all"] || [];
    var resourceEvents = _schemaLoadedEvents["resourceName"] || [];
    
    registeredFuncs = resourceEvents.concat(allEvents);
    
    for(var i = 0; i < registeredFuncs.length; i++) {
      var obj = registeredFuncs[i];
      var newParams = [].concat(obj.params);
      newParams.push(resourceName);
      
      obj.func.apply(null, newParams);
    }
  }
  
  
  /*
   * Initialize all the widgets in the page
   * @method _init
   */
  function _initLayout() {
    _widgets.layout = new YAHOO.widget.Layout({
	units: [
	    { position: 'top', body: 'topFrame', height: 70, collapse: false, resize: false },
	    { position: 'left', body: 'leftFrame', width: 200, collapse: false, resize: false, zIndex: 0 },
	    { position: 'center', body: 'centerFrame', scroll:true, zIndex: 2 }
	]
    });
    
    _widgets.layout.on('render', function() {
      YAHOO.util.Event.onContentReady("navmenu", _initMenu);
      YAHOO.util.Event.onContentReady("tab-container", _initTabView);        
    });
    
    _widgets.layout.render();
  }
  
  /*
   * Initializes the left menu widget
   * @method _initMenu
   */
  function _initMenu() {
    _widgets.leftMenu = new YAHOO.widget.Menu("navmenu", { 
      position: "static",
      lazyload: true
    });
    
    //	Since this Menu instance is built completely from script, call the 
    //	"render" method passing in the DOM element that it should be 
    //	appended to. 
    _widgets.leftMenu.render();
    
    // Show the Menu instance 
    _widgets.leftMenu.show();
  }
  
  /*
   * Add a resource to the menu
   * @method _addResourceToMenu
   * @param {String} resourceName Name of the resource in the API
   */
  function _addResourceToMenu(resourceName) {
    var title = S(resourceName).humanize().toString();
    
    _widgets.leftMenu.addItems([
      { text: title, onclick: { fn: _onResourceItemClick, obj: { resourceName: resourceName } } }
    ]);
    
    _widgets.leftMenu.render();
     
    _widgets.leftMenu.show();
  }
  
  /*
   * Displays only the specified tabview(s), this method is public
   * It can receive a non-limited list of tabNames to be displayed
   * @method displayTabViews
   * @param {String} sTabViewId the name of tab to display
   */
  function displayTabViews(/*sTabViewId1, ..., sTabViewId(n)*/) {
    var args = Array.prototype.slice.call(arguments);
        
    // Hide all tabs
    for(var oTabView in _tabviews) {
      YAHOO.util.Dom.addClass(oTabView, "yui-hidden");
    }
    
    // Show the specified tabview(s)
    for(var i = 0; i < args.length; i++) {
      var sTabViewId = args[i];
      var oTabView = _tabviews[sTabViewId].tabview;
      YAHOO.util.Dom.removeClass(oTabView, "yui-hidden");
    }
  }
  
  
  /*
   * Initializes the welcome tab layout
   * @method _initTabView
   */
  function _initTabView() {
    _createTabView("welcome-tabs", "tab-container", null);
  };
  
  
  /*
   * Create a new Tabview
   * @method _createTabView
   * @param {String} sId Identifier to be used
   * @param {String} sContainerId Container identifier
   * @param {Object/Array} oTabs Object or array of tab objects to be added to the tabview
   */
  function _createTabView(sId, sContainerId, oTabs) {
    // Check if html markup exists
    var oTabView = YAHOO.util.Dom.get(sId);
    
    if(oTabView == null) {
      oTabView = new YAHOO.widget.TabView();
    } else {
      oTabView = new YAHOO.widget.TabView(sId);
    }
    
    // Set the HTML id
    YAHOO.util.Dom.setAttribute(oTabView, 'id', sId);
    
    _tabviews[sId] = {
      tabview: oTabView,
      tabs: [],
    };
        
    // If the param is an object, encapsulate it in an array
    // in order to make it has the same interface
    if(oTabs != null) {
      if(typeof(oTabs) == "object") {
	oTabs = [oTabs];
      }
    
      for(var i = 0; i < oTabs.length; i++) {
	var oTab = oTabs[i];
	_tabviews[sId].tabs.push(oTab);
	_tabviews[sId].tabview.addTab(oTab);
      }
    }
    
    _tabviews[sId].tabview.appendTo(sContainerId);
  }
  
  /*
   * Creates a new tab
   * @method _createTab
   * @param {String} sLabel label to be displayed
   * @param {String} sId identifier to be assigned to the new tab
   * @return {Object} returns the created tab
   */
  function _createTab(sLabel, sId) {
    oTab = new YAHOO.widget.Tab({
      label: sLabel,
      content: "<div id='" + sId + "'></div>",
      active:true
    });
    
    YAHOO.util.Dom.setAttribute(oTab, 'id', "header-" + sId);

    return oTab;
  }
  
  
  /*
   * Load the resource's data on the tabs
   * @method _onResourceItemClick
   * @param {String} action Name of the action performed
   * @param {Object} e Event object
   * @param {Object} parameters Aditional arguments sent to the function
   */
  function _onResourceItemClick(action, e, parameters) {
    var sResourceName = parameters.resourceName;
    var sTabViewId = sResourceName + "-tabs";
    var sDataTabId = sResourceName + "-data-tab";
    var sContainerId = "tab-container";
    
    // Hide all tabs
    displayTabViews();
    
    // Create tab if not already created
    if(!_tabviews[sTabViewId]) {
      _createTabView(sTabViewId, sContainerId, _createTab("Data", sDataTabId));
      
      // Create DataTable
      _createResourceDataTable(sResourceName, sDataTabId);
    } else {
      // If it is already created, display it
      displayTabViews(sTabViewId);
    }
  }
  
  function _hideTab() {
    
  }
  

  /*
   * DataTable helper
   * Returns a request string based on the state of the datatable
   * @method _myRequestBuilder
   * @param {Object} oState DataTable state object
   * @param {Object} oSelf DataTable
   */
  function _myRequestBuilder(oState, oSelf) {
    // Get states or use defaults
    oState = oState || { pagination: null, sortedBy: null };
    var sortField = (oState.sortedBy) ? oState.sortedBy.key : ""; 
    var sortDir = (oState.sortedBy && oState.sortedBy.dir === YAHOO.widget.DataTable.CLASS_DESC) ? "" : "-";
    var offset = (oState.pagination) ? oState.pagination.recordOffset : 0;
    var limit = (oState.pagination) ? oState.pagination.rowsPerPage : 100;

    var sortRequest = (sortField == "") ? "" : "&order_by=" + sortDir + sortField;
    
    // Build custom request
    return  "?format=json" +
	    "&offset=" + offset +
	    "&limit=" + limit +
	    sortRequest;
  }
  
  /*
   * DataTable helper
   * Highlight editable cell, can be use with cellMouseoverEvent
   * @method _highlightEditableCell
   * @params {Object} oArgs Event arguments
   */
  function _highlightEditableCell(oArgs) { 
    var elCell = oArgs.target; 
    if(YAHOO.util.Dom.hasClass(elCell, "yui-dt-editable")) { 
      this.highlightCell(elCell); 
    }
  }
  
  /*
   * DataTable helper
   * Animates color change after cell is edited
   * @method _onCellAfterEditAnimation
   * @params {Object} oArgs Event arguments
   */
  function _onCellAfterEditAnimation(oArgs) {
    var elCell = oArgs.editor.getTdEl();
    var oOldData = oArgs.oldData;
    var oNewData = oArgs.newData;

    // Do the animation only if the data has changed
    if(oOldData != oNewData) {
      // Grab the row el and the 2 colors
      var elRow = this.getTrEl(elCell);
      var origColor = YAHOO.util.Dom.getStyle(elRow.cells[0], "backgroundColor");
      var pulseColor = "#ff0";

      // Create a temp anim instance that nulls out when anim is complete
      var rowColorAnim = new YAHOO.util.ColorAnim(elRow.cells, {
	backgroundColor:{to:origColor, from:pulseColor}, duration:2});
      var onComplete = function() {
	rowColorAnim = null;
	YAHOO.util.Dom.setStyle(elRow.cells, "backgroundColor", "");
      }
      
      rowColorAnim.onComplete.subscribe(onComplete);
      rowColorAnim.animate();
    }
  }
  
  /*
   * Creates DataTables based on the resource's data contained on _modelSchema
   * @method _createResourceDataTable
   * @param {String} resourceName Name of the resource in the API
   * @param {String} containerId Container to draw in the datatable
   */
  function _createResourceDataTable(resourceName, containerId) {
    var responseSchema = _modelSchema[resourceName].responseSchema;
    var dataSource = _buildDataSource(_apiUrl + resourceName + "/", responseSchema);
    
    var myConfig = {
      initialRequest: _myRequestBuilder(),
      generateRequest: _myRequestBuilder,
      dynamicData: true,
      paginator: new YAHOO.widget.Paginator({
	rowsPerPage : 100
      }),
    };
  
    // Create datatable
    _dataTables[resourceName] = new YAHOO.widget.DataTable(
      containerId, 
      _modelSchema[resourceName].columns,
      dataSource, 
      myConfig
    );
    
    // Get total records from server
    _dataTables[resourceName].handleDataReturnPayload = function (oRequest, oResponse, oPayload) {
      oPayload.totalRecords = oResponse.meta.totalRecords;
      return oPayload;
    };
    
    // Select row when clicking over it
    _dataTables[resourceName].subscribe("rowClickEvent", _dataTables[resourceName].onEventSelectRow)
    
    // Edit cell when double click over it
    _dataTables[resourceName].subscribe('cellDblclickEvent', _dataTables[resourceName].onEventShowCellEditor);
    
    // Display a color animation after cell editing
    _dataTables[resourceName].subscribe("editorBlurEvent", _dataTables[resourceName].onEventSaveCellEditor);
    _dataTables[resourceName].subscribe("editorSaveEvent", _onCellAfterEditAnimation);
    

    // Highlight editable cell
    _dataTables[resourceName].subscribe("cellMouseoverEvent", _highlightEditableCell); 
    _dataTables[resourceName].subscribe("cellMouseoutEvent", _dataTables[resourceName].onEventUnhighlightCell);
  }
  
  ////////////////////////////////////////////////////////////////////////////////////////
  
  /*
   * Make an HTTPRequest to the API
   * @method _xhrRequest
   * @param {String} requestUrl string to be appended to the API url
   * @param {function} pointer the success function handler
   * @param {Object} additionalArguments hash containing parameters to be passed to the callback function (optional)
   * @param {Object} customEvents associates the transaction with custom events
   */
  function _xhrRequest(requestUrl, successHandler, additionalArguments, customEvents) {
    var url = _apiUrl + requestUrl;
    
    if(typeof(additionalArguments) == "undefined") {
      var additionalArguments = {};
    }
    
    additionalArguments.url = url;
    
    var callbackObj = {
      success : successHandler,
      failure : _xhrFailureHandler,
      customevents: customEvents,
      argument: additionalArguments,
    }
    
    return YAHOO.util.Connect.asyncRequest('GET', url, callbackObj);
  }
  
  /*
   * Queries the API to know the available endpoints
   * @method _getAPISchema
   */
  function _getAPISchema() {
    var args = Array.prototype.slice.call(arguments);
    
    // Make the request [function was called with no parameters]
    if(typeof(args[0]) == "undefined") {
      _xhrRequest("?format=json", _getAPISchema);
    } else {
      // Proccess the request data [function was called with one parameter]
      var response = args[0];
      
      _modelSchema = YAHOO.lang.JSON.parse(response.responseText);

      for(var modelObjName in _modelSchema) {
	if(typeof(modelObjName) != "undefined") {
	  _getSchemaFields(modelObjName);
	}
      }
    }
  }
  
  
  /*
   * Request the schema from the API and populate the _modelSchema hash with the available
   * available fields
   * @method _getSchemaFields
   * @param {String} resourceName Name of the resource in the API
   */
  function _getSchemaFields(resourceName) {
    var args = Array.prototype.slice.call(arguments);
    
    // Make the request [function was called with a String parameter]
    if(typeof(args[0]) == "string") {
      var resourceName = args[0];
      _xhrRequest(resourceName + "/schema/?format=json", _getSchemaFields, {resourceName: resourceName});
    } else {
      // Proccess the request data [function was called with an Object parameter]
      var response = args[0];
      
      _modelSchema[response.argument.resourceName].fields = YAHOO.lang.JSON.parse(response.responseText).fields;
      _createResourceColumnDef(response.argument.resourceName);
      _schemaLoaded(response.argument.resourceName);
    }
  }
  
  /*
   * Create the column definition needed for DataTables
   * @method _createResourceColumnDef
   * @param {String} resourceName Name of the resource in the API
   */
  function _createResourceColumnDef(resourceName) {
    var fieldList = [];
    var resource = _modelSchema[resourceName];
    
    resource.columns = [];
    
    // If there are attributes common to all columns, copy them as base
    var allAttr = _columnDefs[resourceName].attr.all || {};
    var columns = _columnDefs[resourceName].columns || [];
    
    // If columns definition is empty, load all the fields from schema
    if(columns.length == 0) {
      for(var field in resource.fields) {
	if(field != "resource_uri") {
	  columns.push(field);
	  fieldList.push(field);
	}
      }
    }
    
    for(var i=0; i < columns.length; i++) {
      var columnName = columns[i];
      
      // Clone the attributes for all
      var attr = YAHOO.lang.merge(allAttr);
      
      // Set default attributes
      attr.key = columnName;
      attr.sortable = true;
      
      // Only allow editing on Non-Unique fields
      if(resource.fields[columnName].unique == false) {
	if(resource.fields[columnName].type == "integer" ||
	   resource.fields[columnName].type == "decimal") {
	  attr.editor = new YAHOO.widget.TextboxCellEditor({ validator: YAHOO.widget.DataTable.validateNumber });
	} else {
	  attr.editor = new YAHOO.widget.TextboxCellEditor();
	}
      }
      
      // Set label
      /*
      if(resource.fields[columnName].help_text != "Unicode string data. Ex: \"Hello World\"" &&
	  resource.fields[columnName].help_text != "Integer data. Ex: 2673") {
	attr.label = resource.fields[columnName].help_text;
      } else {
	attr.label = S(columnName).humanize().toString();
      }
      */
      attr.label = S(columnName).humanize().toString();
      
      // Check if there are attributes for this column and override defaults
      var customAttr = _columnDefs[resourceName].attr[columnName];
      if(typeof(customAttr) != "undefined") {
	attr = YAHOO.lang.merge(attr, customAttr);
      }
      
      resource.columns.push(attr);
      fieldList.push(columnName);
    }
    
    // Create the expected responseSchema
    _modelSchema[resourceName].responseSchema = { 
      resultsList: "objects",
      fields: fieldList,
      metaFields: { totalRecords: "meta.total_count" }
    };
  }
  
  /*
   * Defines the order and attributes for fields on each resource
   * @method _defineColumnsAttr
   */
  function _defineColumnsAttr() {
    _columnDefs = {
      "categories": {
	attr: {
	  all: {
	    sortable: true,
	  }
	},
	columns: [],
      },
      "products": {
	attr: {
	  all: {},
	},
	columns: [
	  "prod_id",
	  "title",
	  "actor",
	  "price",
	  "category",
	]
      },
      "customers": {
	attr: {
	  "customerid": {
	    label: "Customer ID",
	  }
	},
	columns: [
	  "customerid",
	  "firstname",
	  "lastname",
	  "gender",
	  "age",
	  "phone",
	  "country",
	  "region",
	  "state",
	  "city",
	  "address1",
	  "address2",
	  "zip",
	]
      }
    };
    
    
    
  }
  
  /* Creates a DataSource for the specified url and returns the JSON data
   * obtained from it
   * @method _buildDataSource
   * @param {String} sourceUrl url where the data is located
   * @param {Object} responseSchema specifies what to take from the response
   * 	{ resultsList: {String},
   * 	  fields: {Array}
   *    }
   */
  function _buildDataSource(sourceUrl, responseSchema) {   
    var myDataSource = new YAHOO.util.DataSource(sourceUrl);
    myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
    myDataSource.connXhrMode = "queueRequests";
    myDataSource.responseSchema = responseSchema;
    
    return myDataSource;
  }
  
  function onMenuItemClick() {
    displayError(this.text);
  }
  
  
  /*
   * Catches errors produced on HTTPRequests
   * @method _xhrFailureHandler
   * @param {Object} oRequest contains the original requests
   * @param {Object} oParsedResponse contains more information about the request
   */
  function _xhrFailureHandler(response) {
    displayError("Error calling <br/>'" + response.argument.url + "'" + response.statusText);
  }
  
  /*
   * Displays an error message
   * @method displayError
   */
  function displayError(textMsg) {
    // Instantiate the Dialog
    _widgets.dialog = new YAHOO.widget.SimpleDialog("errorDialog", {
      width: "400px",
      fixedcenter: true,
      visible: false,
      draggable: false,
      close: true,
      text: textMsg,
      icon: YAHOO.widget.SimpleDialog.ICON_WARN,
      constraintoviewport: true,
      buttons: [ { text:"OK", handler: function() { this.hide(); this.destroy(); }, isDefault:true } ]
    } );
    
    _widgets.dialog.setHeader("Error");
    _widgets.dialog.render("centerFrame");
    _widgets.dialog.show();
  }
  
  return {
    displayError: displayError,
    displayTabViews: displayTabViews,
  }
})();