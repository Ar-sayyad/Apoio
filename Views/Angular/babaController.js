app.controller('babaController', function($scope) {
    $scope.pagename = "BABA";
    CreateTableFromJSON();
});
function CreateTableFromJSON() {  
      var Array = {
    "Header": [{
        "Id": 1,
        "Name": "InspectionLot"
    }, {
        "Id": 2,
        "Name": "DateTime"
    }, {
        "Id": 3,
        "Name": "FCK+90"
    }, {
        "Id": 4,
        "Name": "FCPY+212"
    }, {
        "Id": 5,
        "Name": "FCPYIM"
    }, {
        "Id": 6,
        "Name": "FCPYASH"
    }],
    "Item": [
        [{
            "Id": 1,
            "Name": "30000089861"
        }, {
            "Id": 2,
            "Name": "25.02.2019 00:55:00"
        }, {
            "Id": 3,
            "Name": "21"
        }, {
            "Id": 4,
            "Name": "45"
        }, {
            "Id": 5,
            "Name": "15"
        }, {
            "Id": 6,
            "Name": "52"
        }],
        [{
            "Id": 1,
            "Name": "30000089861"
        }, {
            "Id": 2,
            "Name": "25.02.2019 04:55:00"
        }, {
            "Id": 3,
            "Name": "52"
        }, {
            "Id": 4,
            "Name": "13"
        }, {
            "Id": 5,
            "Name": "16"
        }, {
            "Id": 6,
            "Name": "32"
        }],
        [{
            "Id": 1,
            "Name": "30000089861"
        }, {
            "Id": 2,
            "Name": "25.02.2019 08:55:00"
        }, {
            "Id": 3,
            "Name": "66"
        }, {
            "Id": 4,
            "Name": "44"
        }, {
            "Id": 5,
            "Name": "17"
        }, {
            "Id": 6,
            "Name": "15"
        }],
        [{
            "Id": 1,
            "Name": "30000089861"
        }, {
            "Id": 2,
            "Name": "25.02.2019 12:55:00"
        }, {
            "Id": 3,
            "Name": "35"
        }, {
            "Id": 4,
            "Name": "14"
        }, {
            "Id": 5,
            "Name": "18"
        }, {
            "Id": 6,
            "Name": "25"
        }]
    ]
};
var head=[];
var rows=[];
$.each(Array.Header, function (key) {
    head.push({
        title: Array.Header[key].Name
    })
});
   $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: ['pageLength', 'copy', 'csv', 'excel', 'print'],
        columns: head
    });  

  $.each(Array.Item, function (key) {  
        var arr=[]; 
        for(var i=0;i<Array.Header.length;i++){ 
                arr.push(Array.Item[key][i].Name);
        }     
        rows.push(arr);
  });

 var t = $('#example').DataTable();
   $.each(rows, function (key) {
          t.row.add(rows[key]).draw(!1);
   });
     
}