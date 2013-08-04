var myHomePage = (function () {
  
  var //
  _dataSources = {},
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
    
    var resourceName = "categories";
    onSchemaLoaded(resourceName, _createDataTable, [resourceName, "tab1-content"]);
    
    resourceName = "products";
    onSchemaLoaded(resourceName, _createDataTable, [resourceName, "tab2-content"]);
  }
  
  
  function onSchemaLoaded(resourceName, registeredFunction, parameters) {
    if(typeof(_schemaLoadedEvents[resourceName]) == "undefined") {
      _schemaLoadedEvents[resourceName] = {
	func: registeredFunction,
	params: parameters
      }
    } else {
      oldFunction = _schemaLoadedEvents[resourceName].func;
      oldParams = _schemaLoadedEvents[resourceName].params;
      
      _schemaLoadedEvents[resourceName] = {
	func: function() {
	  oldFunction.apply(null, oldParams);
	  registeredFunction.apply(null, parameters);
	},
	params: []
      }
    }
  }
  
  function _schemaLoaded(resourceName) {
    if(typeof(_schemaLoadedEvents[resourceName]) != "undefined") {
      var registeredFunction = _schemaLoadedEvents[resourceName].func;
      var parameters = _schemaLoadedEvents[resourceName].params;
      
      registeredFunction.apply(null, parameters);
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
      YAHOO.util.Event.onContentReady("navmenu", _createMenu);
      YAHOO.util.Event.onContentReady("tabs", _createTabs);        
    });
    
    _widgets.layout.render();
  }
  
  /*
   * Create the left menu widget
   * @method _createMenu
   */
  function _createMenu() {
    _widgets.leftMenu = new YAHOO.widget.Menu("navmenu", { 
      position: "static",
      lazyload: true
    });

    //	Add items to the Menu instance by passing an array of object literals 
    //	(each of which represents a set of YAHOO.widget.MenuItem 
    //	configuration properties) to the "addItems" method.
 
    _widgets.leftMenu.addItems([ 
      { text: "Customers", onclick: { fn: onMenuItemClick },
	submenu: {
	  id: "CustomerOptions",
	  itemdata: [
	    { text: "Create", onclick: { fn: onMenuItemClick } },
	    { text: "Search", onclick: { fn: onMenuItemClick } },
	  ]
	}
      },
      { text: "Orders", onclick: { fn: onMenuItemClick }  },
      { text: "Products", onclick: { fn: onMenuItemClick }  },
      { text: "Inventory", onclick: { fn: onMenuItemClick }  },
    ]);
    
    //	Since this Menu instance is built completely from script, call the 
    //	"render" method passing in the DOM element that it should be 
    //	appended to. 
    _widgets.leftMenu.render();
    
    // Show the Menu instance 
    _widgets.leftMenu.show();
  }
  
  /*
   * Creates the main tab layout
   * @method _createTabs
   */
  function _createTabs() {
    _widgets.mainTabs = new YAHOO.widget.TabView("tabs");
  };
  

  /*
   * Creates datatables based on the data contained on _modelSchema
   * @method _createDataTable
   * @param {String} resourceName Name of the resource in the API
   * @param {String} containerId Container to draw in the datatable
   */
  function _createDataTable(resourceName, containerId) {
    console.log(resourceName);
    var fieldList = [];
    for(var field in _modelSchema[resourceName].fields) {
      fieldList.push(field);
    }
    var responseSchema = { 
      resultsList: "objects",
      fields: fieldList
    };
    
    var dataSource = _buildDataSource(_apiUrl + resourceName + "/", responseSchema);
  
    var myConfig = {};
    myConfig["initialRequest"] = "?format=json";
  
    // Create datatable
    var myDataTable = new YAHOO.widget.DataTable(
      containerId, 
      _modelSchema[resourceName].columns,
      dataSource, 
      myConfig
    );    
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
	}
      }
    }
    
    for(var i in columns) {
      var columnName = columns[i];
      
      // Clone the attributes for all
      var attr = YAHOO.lang.merge(allAttr);
      
      // Set default attributes
      attr.key = columnName;
      attr.sortable = true;
      
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
    }
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
  }
})();