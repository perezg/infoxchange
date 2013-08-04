function getPaginatorConfig() {
    paginator : new YAHOO.widget.Paginator({
        rowsPerPage: 50, // REQUIRED
        //totalRecords: 10000, // OPTIONAL
 
        // use an existing container element
        containers: 'my_pagination',
 
        // use a custom layout for pagination controls
        template: "{PageLinks} Show {RowsPerPageDropdown} per page",
 
        // show all links
        pageLinks: 10000, //YAHOO.widget.Paginator.VALUE_UNLIMITED,
 
        // use these in the rows-per-page dropdown
        rowsPerPageOptions: [25, 50, 100],
 
        // use custom page link labels	
        pageLabelBuilder: function (page,paginator) {
            var recs = paginator.getPageRecords(page);
            return (recs[0] + 1) + ' - ' + (recs[1] + 1);
        }
        
    })
};

function loadDataTable() {
  var myColumnDefs = [
    {key:"prod_id", label:"Product Id"},
    {key:"category", label:"Category"},
    {key:"title", label:"Title", sortable:true},
    {key:"actor", label:"Actor", sortable:true},
    {key:"price", label:"Price", sortable:true},
    {key:"special", label:"Special"},
  ];

  var myDataSource = new YAHOO.util.DataSource("/infoxchange/api/v1/products/?");
  myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
  myDataSource.connXhrMode = "queueRequests";
  myDataSource.responseSchema = {
      resultsList: "objects",
      fields: ["prod_id","category","title","actor","price","special"]
  };

  //var myConfig = getPaginatorConfig();
  var myConfig = {};
  myConfig["initialRequest"] = "format=json";
  
  // Create datatable
  var myDataTable = new YAHOO.widget.DataTable("tab2-content", myColumnDefs,
    myDataSource, myConfig);
  
  return {
    oDS: myDataSource,
    oDT: myDataTable
  };
};



/*
 * Create a YAHOO.util.DataSource
 * (those arguments marked with * are required)
 * @method: buildDataSource( {
 * 	*source		Where the data is located
 * 	responseType	Any of the following
 * 			TYPE_JSARRAY
 * 			TYPE_JSON		(default)
 * 			TYPE_XML
 * 			TYPE_TEXT
 * 			TYPE_HTMLTABLE
 * 	*fields		Array of string names for each field of data coming in
 * 			(required if responseSchema is not provide)
 * 	responseSchema	Defines how the data is structured, by default it assumes the fields are
 * 			inside of 'objects'
 */ 			
function buildDataSource(args) {
  var myDataSource = new YAHOO.util.DataSource("/infoxchange/api/v1/products/?");
  myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
  myDataSource.connXhrMode = "queueRequests";
  myDataSource.responseSchema = {
      resultsList: "objects",
      fields: ["prod_id","category","title","actor","price","special"]
  };
}


var myRevealingModule = function () {
  
  function init() {
    
  }

  /*
    * Create a YAHOO.widget.DataTable using and insert it on the specified container
    * (those arguments marked with * are required)
    * @method: buildDataTable( { 
    *     *containerId: 	String with the id of the container
    *     *columnDefs:	Array with the datatable column definition
    * 			[
    * 				{ 
    * 				       *key: 		"field_name",
    * 					field:		"fieldname", // Map to the datasource, default is the column's key
    * 					label: 		"Field Name",
    * 					sortable:	true/false,
    * 					resizeable:	true/false,
    * 					selected:	true/false,
    * 					formater:	funcFormater, // Function pointer
    *					hidden:		true/false,
    * 					width:		number,
    *					minWidth:	number,
    * 			]
    * 	sourceUrl: 	Where the data is located (if dataSource is not provided)
    * 	fields:		Array containing the mapping to the datasource (if dataSource is not provided)
    * 	dataSource:	YAHOO.util.DataSource object
    * } )
  */
  funtion buildDataTable(args) {
    args = args || {};
    
    var dataSource = (args.dataSource ? args.dataSource | )
    
    if(args.dataSource) {
      
    } else {
      
    }
  }
  
  
  return {
    init:		init,
    buildDataTable:	buildDataTable,
    buildDataSource:	buildDataSource,
  }
}

myRevealingModule.init();
