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