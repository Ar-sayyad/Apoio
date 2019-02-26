var filterCnt = [];
app.controller('rankingController', function ($scope) {
    $scope.pagename = "Ranking";
    var now = new Date();
    $(function () {
        var month = (now.getMonth() + 1);
        var day = now.getDate();
        if (month < 10)
            month = "0" + month;
        if (day < 10)
            day = "0" + day;
        var today = now.getFullYear() + '-' + month + '-' + day;
        $("#todaysDate").val(today);
        $("#todaysDate").datepicker({
            dateFormat: 'yy-mm-dd',
            maxDate: '0'
        });
    });
    /**** DISPLAY ZONE : start ****/
    var url = baseServiceUrl + 'elements?path=\\\\' + afServerName + '\\' + afDatabaseName + '\\' + rankingParent + '&selectedFields=Name;Webid;Links.Elements';
    var parentList = processJsonContent(url, 'GET', null);
    $.when(parentList).fail(function () {
        warningmsg("Cannot Find the Parent Element.")
    });
    $.when(parentList).done(function () {
        var parentListLinkElements = (parentList.responseJSON.Links.Elements);
        var url = parentListLinkElements + '?templateName=' + defaultRankingTemplate + '&selectedFields=Items.Name;Items.Webid;&searchFullHierarchy=true';
        var parentTemplateList = processJsonContent(url, 'GET', null);
        $.when(parentTemplateList).fail(function () {
            warningmsg("Cannot Find the Element Templates.")
        });
        $.when(parentTemplateList).done(function () {
            var parentTemplateListItems = (parentTemplateList.responseJSON.Items);
            $.each(parentTemplateListItems, function (key) {
                $("#parentTemplateList").append("<option  data-name=" + parentTemplateListItems[key].Name + " value=" + parentTemplateListItems[key].WebId + ">" + parentTemplateListItems[key].Name + "</option>")
            })
        })
    });
    var params = '';
    $.each(rankingParameters, function (key) {
        $("#parameterList").append("<option  data-name=" + rankingParameters[key].name +
            " data-id=" + rankingParameters[key].sid +
            " top-sort=" + rankingParameters[key].top +
            " bottom-sort=" + rankingParameters[key].bottom +
            " value=" + key + ">" + rankingParameters[key].name + "</option>");
        params += "<option  data-name=" + rankingParameters[key].name +
            " data-id=" + rankingParameters[key].sid +
            " top-sort=" + rankingParameters[key].top +
            " bottom-sort=" + rankingParameters[key].bottom +
            " value=" + (key + 1) + ">" + rankingParameters[key].name + "</option>";
    });
    /**** DISPLAY ZONE : end ****/
    var selectOperator = '';
    $.each(operators, function (key) {
        selectOperator += "<option  value='" + operators[key].operator + "'>" + operators[key].operator + "</option>";
    });
    var append = 3;
    filterCnt.push(1);    
    filterCnt.push(2);
    $("#addExpress").click(function () {
        filterCnt.push(append);
        $("#filterAdd").append('<div class="filtering" id="filtering' + append + '">\n\
                                <select  class="floatLeft form-control params" style="width:30%;" id="params'+ append + '">\n\
                                    <option value="" selected="" disabled="">--Select Parameter--</option>'
            + params +
            '</select>\n\
                                <select  class="floatLeft form-control operator" style="width:28%;" id="operator'+ append + '">\n\
                                    <option value="" selected="" disabled="">--Select Operator--</option>'
            + selectOperator +
            '</select>\n\
                                <input type="text" autocomplete="off" style="width:15%;" onkeydown="getReload(event);" class="floatLeft form-control number" id="number'+ append + '" placeholder="Number">\n\
                                <button type="button" onclick="deleteParentElement(this,'+ append + ');"  class="floatLeft btn btn-default remove"><i class="ti-close"></i></button> \n\
                            </div>');
        append++;
        $("#reloadTable").show();
    });

    $("#reloadTable").click(function () {
        var data = [];
        if (filterCnt.length >= 1) {
            // by default: PH < 2.5 && PH > 0
            for (var i = 0; i < filterCnt.length; i++) {
                let index = parseInt($("#params" + filterCnt[i]).val());
                let operator = $("#operator" + filterCnt[i]).val();
                let val = $("#number" + filterCnt[i]).val();
                let name = $("#params" + filterCnt[i] + " option:selected").attr("data-name");
                if (isNaN(index) || index == '' || operator == null || isNaN(val) || val == '') {
                    $("#filtering" + filterCnt[i]).css("border", "1px solid red");
                } else {
                    $("#filtering" + filterCnt[i]).css("border", "1px solid #dee2e6");
                    data.push({
                        "index": index,
                        "operator": operator,
                        "value": val,
                        "key": name
                    });
                }
            }
        }
        if (data.length > 0) {
            reloadTable(data);
        } else { warningmsg("Select Atleast One Expression..!"); }
    });        
});

var rankingElements = [];
var cols = [];
function getData() {
    $("#topTable").html('<img src="assets/images/img.gif" class="loader">');
    $("#bottomTable").html('<img src="assets/images/img.gif" class="loader">');
    rankingElements = [];
    var currentDateTime = $('#todaysDate').val() + 'T00:00:00Z';
    var blockList = $("#blockList").val();
    var name = $("#parentTemplateList option:selected").attr("data-name");
    var pathUrl = '';
    $.each(rankingParameters, function (key1) {
        pathUrl += '&path={0}|' + rankingParameters[key1].name;
    });
    /**** Search cell list or producer list : start ****/
    if (blockList === 'CELL' || blockList === 'PRODUCER') {
        var batch = {
            "database": {
                "Method": "GET",
                "Resource": baseServiceUrl + "assetdatabases?path=\\\\" + afServerName + "\\" + afDatabaseName + "&selectedFields=WebId;Links.Elements"
            },
            "elements": {
                "Method": "GET",
                "Resource": "{0}?templateName=" + blockList + "&nameFilter=" + name + "*&selectedFields=Items.Name;Items.Path;&searchFullHierarchy=true",
                "ParentIds": ["database"],
                "Parameters": ["$.database.Content.Links.Elements"]
            },
            "attributes": {
                "Method": "GET",
                "RequestTemplate": {
                    "Resource": baseServiceUrl + "attributes/multiple?selectedFields=Items.Object.Name;Items.Object.Path;Items.Object.WebId" + pathUrl
                },
                "ParentIds": ["elements"],
                "Parameters": ["$.elements.Content.Items[*].Path"]
            },
            "values": {
                "Method": "GET",
                "RequestTemplate": {
                    "Resource": baseServiceUrl + "streams/{0}/recordedattime?time=" + currentDateTime
                },
                "ParentIds": ["attributes"],
                "Parameters": ["$.attributes.Content.Items[*].Content.Items[*].Object.WebId"]
            }
        };
        var batchStr = JSON.stringify(batch, null, 2)
        var batchResult = processJsonContent(baseServiceUrl + "batch", 'POST', batchStr);
        $.when(batchResult).fail(function () {
            warningmsg("Cannot Launch " + blockList + " Batch!!!");
        });
    } else {
        var tuzBatch = {
            "parent": {
                "Method": "GET",
                "Resource": baseServiceUrl + "elements?path=\\\\" + afServerName + "\\" + afDatabaseName + "\\Zones\\" + name + "&selectedFields=WebId;Links.Elements"
            },
            "elements": {
                "Method": "GET",
                "Resource": "{0}?templateName=" + blockList + "&selectedFields=Items.Name;Items.Path;&searchFullHierarchy=true",
                "ParentIds": ["parent"],
                "Parameters": ["$.parent.Content.Links.Elements"]
            },
            "attributes": {
                "Method": "GET",
                "RequestTemplate": {
                    "Resource": baseServiceUrl + "attributes/multiple?selectedFields=Items.Object.Name;Items.Object.Path;Items.Object.WebId" + pathUrl
                },
                "ParentIds": ["elements"],
                "Parameters": ["$.elements.Content.Items[*].Path"]
            },
            "values": {
                "Method": "GET",
                "RequestTemplate": {
                    "Resource": baseServiceUrl + "streams/{0}/recordedattime?time=" + currentDateTime
                },
                "ParentIds": ["attributes"],
                "Parameters": ["$.attributes.Content.Items[*].Content.Items[*].Object.WebId"]
            }
        }
        var tuzBatchStr = JSON.stringify(tuzBatch, null, 2)
        var batchResult = processJsonContent(baseServiceUrl + "batch", 'POST', tuzBatchStr);
        $.when(batchResult).fail(function () {
            warningmsg("Cannot Launch TUZ Batch.");
        });
    }

    $.when(batchResult).done(function () {
        var batchResultItems = (batchResult.responseJSON.attributes.Content.Items);
        let valuesID = 0;
        $.each(batchResultItems, function (elementID) {
            var attrItems = batchResultItems[elementID].Content.Items;
            var elementName = batchResult.responseJSON.elements.Content.Items[elementID].Name;
            var elementItems = [];
            elementItems[0] = elementName;
            attrItems.forEach(function (attr, attrID) {
                let attrValue = "-"
                if (attr != undefined && attr.Object != undefined) {
                    attrName = attr.Object.Name;
                    const getNestedObject = (nestedObj, pathArr) => {
                        return pathArr.reduce((obj, key) =>
                            (obj && obj[key] != undefined) ? obj[key] : undefined, nestedObj);
                    }
                    if (batchResult.responseJSON.values.Content.Items != undefined &&
                        (batchResult.responseJSON.values.Content.Status == undefined || batchResult.responseJSON.values.Content.Status < 400) &&
                        batchResult.responseJSON.values.Content.Items[valuesID].Status == 200) {
                        var attrV = getNestedObject(batchResult.responseJSON.values,
                            ['Content', 'Items', valuesID, 'Content', 'Value'])
                        if (attrV !== "" && !isNaN(attrV)) {
                            attrValue = (Math.round((attrV) * 100) / 100);
                        }
                    }
                }
                elementItems[attrID + 1] = attrValue;
                valuesID++
            });
            rankingElements[elementID] = elementItems;
        });
        loadTable();
    });
}
cols.push({ title: "Name" })
$.each(rankingParameters, function (key1) {
    cols.push({
        title: rankingParameters[key1].name
    })
});

function deleteParentElement(n, append) {
    n.parentNode.remove();
    if (filterCnt.length > 1) {
        var index = filterCnt.indexOf(append);
        if (index > -1) {
            filterCnt.splice(index, 1);
        }
        $('#reloadTable').trigger('click');
    } else {
        filterCnt = [];
        $("#reloadTable").hide();
        loadTable();
    }
}

function getReload(event) {
    if (event.keyCode == 13) {
        $('#reloadTable').trigger('click');
    }
}
function filterLength(){
        var bottomTable = $('#bottom-table').DataTable();
        var topTable = $('#data-table').DataTable();
        var pagelen = topTable.page.len();
          bottomTable.page.len(pagelen).draw();
           $('#data-table').on('length.dt', function (e,settings,len ) {
                   bottomTable.page.len(len).draw();
           });
    } 
function loadTable() {
    var data = [];
    if (filterCnt.length >= 1) {
        for (var i = 0; i < filterCnt.length; i++) {
            let index = parseInt($("#params" + filterCnt[i]).val());
            let operator = $("#operator" + filterCnt[i]).val();
            let val = $("#number" + filterCnt[i]).val();
            let name = $("#params" + filterCnt[i] + " option:selected").attr("data-name");
            if (isNaN(index) || index == '' || operator == null || isNaN(val) || val == '') {
                $("#filtering" + filterCnt[i]).css("border", "1px solid red");
            } else {
                $("#filtering" + filterCnt[i]).css("border", "1px solid #dee2e6");
                data.push({
                    "index": index,
                    "operator": operator,
                    "value": val,
                    "key": name
                });
            }
        }
    }
    if (data.length > 0) {
        reloadTable(data);
    }
    else {
        $("#topTable").html(' <table id="data-table" class="order-column table top-table table-bordered"></table>');
        $("#bottomTable").html(' <table id="bottom-table" class="order-column table top-table table-bordered"></table>');
        let v = parseInt($("#parameterList").val())
        let columnID = v + 1 // the table starts with the NAME
        let top = rankingParameters[v].top
        let bottom = rankingParameters[v].bottom
        $('#data-table').DataTable({
            data: rankingElements,
            columns: cols,
            order: [[columnID, top]],
            info: false,
            retrieve: true,
            searching: false,
            paging: true,
            dom: 'Bfrtip',
            buttons: 
                    [{ extend:'excelHtml5',
                        text:'<i class="fa fa-file-excel-o"></i>',
                        titleAttr:'Excel'
                      },
                      'pageLength'
                     ],
            columnDefs: [{
                targets: "_all",
                orderable: false
            }],
           lengthMenu: [[10, 20, 30], [10, 20, 30]]
        });
        $('#bottom-table').DataTable({
            data: rankingElements,
            columns: cols,
            order: [[columnID, bottom]],
            info: false,
            retrieve: false,
            searching: false,
            paging: true,
            columnDefs: [{
                targets: "_all",
                orderable: false
            }],
        });
    }     
    filterLength();
}


function reloadTable(filteringItems) {
    $("#topTable").html('<img src="assets/images/img.gif" class="loader">');
    $("#bottomTable").html('<img src="assets/images/img.gif" class="loader">');
    var filteredData = rankingElements.filter(function (value) {
        let globalCondition = true;
        filteringItems.forEach(function (filteringItem) {
            let condition = compare(value[filteringItem.index], filteringItem.operator, filteringItem.value)
            globalCondition = condition && globalCondition
        });
        return globalCondition
    })

    function compare(value, operator, valueFromFilter) {
        let b;
        switch (operator) {
            case "=":
                b = (value == valueFromFilter ? true : false);
                break;
            case ">":
                b = value > valueFromFilter ? true : false;
                break;
            case "<":
                b = value < valueFromFilter ? true : false;
                break;
            case ">=":
                b = value >= valueFromFilter ? true : false;
                break;
            case "<=":
                b = value <= valueFromFilter ? true : false;
                break;
            default:
                break;
        }
        return b;
    }

    $("#topTable").html(' <table id="data-table" class="order-column table top-table table-bordered"></table>');
    $("#bottomTable").html(' <table id="bottom-table" class="order-column table top-table table-bordered"></table>');
    let v = parseInt($("#parameterList").val())
    let columnID = v + 1 // the table starts with the NAME
    let top = rankingParameters[v].top
    let bottom = rankingParameters[v].bottom
    $('#data-table').DataTable({
        data: filteredData,
        columns: cols,
        order: [[columnID, top]],
        info: false,
        retrieve: true,
        searching: false,
        dom: 'Bfrtip',
        buttons: 
                [{ extend:'excelHtml5',
                    text:'<i class="fa fa-file-excel-o"></i>',
                    titleAttr:'Excel'
                  },
                  'pageLength'
                 ],
        columnDefs: [{
            targets: "_all",
            orderable: false
        }],
        lengthMenu: [[10, 20, 30], [10, 20, 30]]
    });
    $('#bottom-table').DataTable({
        data: filteredData,
        columns: cols,
        order: [[columnID, bottom]],
        info: false,
        retrieve: false,
        searching: false,
        paging: true,
        columnDefs: [{
            targets: "_all",
            orderable: false
        }]
    });  
    filterLength();
}

