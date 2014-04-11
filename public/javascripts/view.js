/****************************************** TODO *************************************
1. add more columns to the static listing table.
2. add more boxes summary listing.
3. add alert boxes to trivial functions.
4. add confirmation boxes to non-trivial functions.
****************************************************************************************/

var hostName = [];
var newTabFunctions = {
    'tab-1' : /* function */
        function() {
            hostName.forEach( getHostInfo );
        },
    'tab-2' : /* function */
        function() {
            hostName.forEach( getStaticList );
        },
    'tab-3' : /* function */
        function() {
           
            getNetList();
        },
    'tab-4' : /* function */
        function() {
            hostName.forEach(getMonitorList);
            $("#monitoring").on("interval", {duration: 8000}, function () {
                $.ajax({
                    url: "/vm/list/runtime?hostName=" + hostName[0],
                    type: "GET",
                    dataType: "json",
                    success: function (resp) {
                        $("#monitoring .inner-table >tbody >tr").each(function () {
                            var vmN = $(this).find(">td + td").html();
                            for (var i = 0; i < resp.length; i++) {
                                if (vmN == resp[i]['name']) {
                                    var chart = $(this).find(".chart-container").highcharts();
                                    chart.series[1].setData(resp[i]['cpu']);
                                    chart.series[0].setData(resp[i]['memory']);
                                }
                            }
                        });
                    },
                    error: function (xhr, status) {
                        alert(status);
                    }
                });
            });
        }
};

var oldTabFunctions = {
    'tab-1' : /* function */
        function() {
            removeSummary();
        },
    'tab-2' : /* function */
        function() {
            removeStaticList();
        },
    'tab-3' : /* function */
        function() {
           
            removeNetList();
        },
    'tab-4' : /* function */
        function() {
            $("#monitoring").off("interval");
            removeMonitorList();
        }
};

/************************************* button event handlers ******************************/

$(".icons").click( function ( event ) {
        $(".icons-select").removeClass("icons-select");
        $( this ).addClass("icons-select");
});

$("#sidebar .fa-refresh").on("click", function( event ) {
        $.getJSON("/host/list", function( json ) {
            $("#selectable li").remove();
            var i = 0;
            var str = "";
            while (json[i++]) {
                str += "<li class=\"ui-widget-content\">" + json[i - 1] + "</li>";
            }
            $("#selectable").append(str);
        });
});

$("#summary .fa-refresh").on("click", function( event ) {
    removeSummary();
    hostName.forEach( getHostInfo );
});

$("#static-list .fa-refresh").on("click", function( event ) {
    removeStaticList();
    hostName.forEach( getStaticList );
});

$("#static-list .fa-play").on("click", function( event ) {
    var vmName = $(".vm-row-selected td:nth-child(2)").html();
    var params = $.param({"hostName": hostName[0], "vmName": vmName});
    $.ajax({
        url: "/vm/start?" + params,
        type: "PUT",
        dataType: 'text',
        success: function (resp) {
            console.log( resp );
            $("#static-list .fa-refresh").triggerHandler("click");
        },
        error: function (xhr, status) {
            alert("sorry there was a problem!");
        }
    });
});

$("#static-list .fa-times").on("click", function( event ) {
    var vmName = $(".vm-row-selected td:nth-child(2)").html();
    var params = $.param({"hostName": hostName[0], "vmName": vmName});
    $.ajax({
        url: "/vm/delete?" + params,
        type: "DELETE",
        dataType: "text",
        success: function( resp ) {
            console.log(resp);
            $("#static-list .fa-refresh").triggerHandler("click");
        },
        error: function (xhr, status) {
            alert("sorry there was a problem");
        }
    });
    $("#inner-content .fa-refresh").trigger("click");
});

$("#static-list .fa-power-off").on("click", function( event ) {
    var vmName = $(".vm-row-selected td:nth-child(2)").html();    
    var params = $.param({"hostName": hostName[0], "vmName": vmName});
    $.ajax({
        url: "/vm/poweroff?" + params,
        type: "PUT",
        dataType: "text",
        success: function( resp ) {
            console.log(resp);
            $("#static-list .fa-refresh").triggerHandler("click");
        },
        error: function (xhr, status) {
            alert("sorry there was a problem");
        }
    });
});

$("#storage-bar .fa-refresh").on("click", function (event) {
    getStorageList(hostName[0]);
});

$("#storage-bar .fa-times").on("click", function (event) {
    if ($(".storage-row-selected").hasClass("p-head")) {
        //delete the pool api call
        var pN = $(".storage-row-selected").find(">span").html();
        var params = $.param({"hostName": hostName[0], "poolName": pN});
        $.ajax({
            url: "/storage/pool/delete?" + params,
            type: "DELETE",
            dataType: "text",
            success: function (resp) {
                console.log(resp);
            },
            error: function (xhr, status) {
                alert(status);
            }
        });
    }
    else if ($(".storage-row-selected").hasClass("v-head")){
        //delete the volume api call
        var vN = $(".storage-row-selected").find(">span").html();
        var pN = $(".storage-row-selected").parent().siblings("div").find(">span").text();
        var params = $.param({"hostName": hostName[0], "poolName": pN, "volName": vN});
         
        $.ajax({
            url: "/storage/vol/delete?" + params,
            type: "DELETE",
            dataType: "text",
            success: function (resp) {
                console.log(resp);
            },
            error: function (xhr, status) {
                alert(status);
            }
        });
    }
});

$("#monitoring .fa-refresh").on("click", function (event) {
    removeMonitorList();
    hostName.forEach(getMonitorList);
});

$("#monitoring .fa-stop").on("click", function (event) {
    var vN = $(".vm-monitoring-row-selected").find(">td + td").html();
    console.log("shutdown " + vN);
    var params = $.param({"hostName": hostName[0], "vmName": vN});
    $.ajax({
        url: "/vm/shutdown?" + params,
        type: "PUT",
        dataType: "text",
        success: function( resp ) {
            console.log(resp);
        },
        error: function (xhr, status) {
            alert("sorry there was a problem");
        }
    });
});

$("#monitoring .fa-play").on("click", function (event) {
    var vN = $(".vm-monitoring-row-selected").find(">td + td").html();
    console.log("power off " + vN);
    var params = $.param({"hostName": hostName[0], "vmName": vN});
    $.ajax({
        url: "/vm/resume?" + params,
        type: "PUT",
        dataType: "text",
        success: function( resp ) {
            console.log(resp);
        },
        error: function (xhr, status) {
            alert("sorry there was a problem");
        }
    });
});

$("#monitoring .fa-pause").on("click", function (event) {
    var vN = $(".vm-monitoring-row-selected").find(">td + td").html();
    console.log("pause  " + vN);
    var params = $.param({"hostName": hostName[0], "vmName": vN});
    $.ajax({
        url: "/vm/suspend?" + params,
        type: "PUT",
        dataType: "text",
        success: function( resp ) {
            console.log(resp);
        },
        error: function (xhr, status) {
            alert("sorry there was a problem");
        }
    });
});

$("#network .fa-refresh").on("click", function( event ) {
    removeNetList();
    getNetList();
});

$("#network .fa-play").on("click", function( event ) {
    var netName = $(".net-row-selected td:nth-child(1)").html();
    var params = $.param({"netName": netName, "hostName": hostName[0]});
    $.ajax({
        url: "/network/start?" + params,
        type: "PUT",
        dataType: 'text',
        success: function (resp) {
            console.log( resp );
            $("#network .fa-refresh").triggerHandler("click");
        },
        error: function (xhr, status) {
            alert("sorry there was a problem!");
        }
    });
});

$("#network .fa-times").on("click", function( event ) {
    var netName = $(".net-row-selected td:nth-child(1)").html();
    var params = $.param({"netName": netName, "hostName": hostName[0]});
    $.ajax({
        url: "/network/delete?" + params,
        type: "DELETE",
        dataType: "text",
        success: function( resp ) {
            console.log(resp);
            $("#network .fa-refresh").triggerHandler("click");
        },
        error: function (xhr, status) {
            alert("sorry there was a problem");
        }
    });
    $("#inner-content .fa-refresh").trigger("click");
});

$("#network .fa-stop").on("click", function( event ) {
    var netName = $(".net-row-selected td:nth-child(1)").html();    
    var params = $.param({"netName": netName, "hostName": hostName[0]});
    $.ajax({
        url: "/network/stop?" + params,
        type: "PUT",
        dataType: "text",
        success: function( resp ) {
            console.log(resp);
            $("#network .fa-refresh").triggerHandler("click");
        },
        error: function (xhr, status) {
            alert("sorry there was a problem");
        }
    });
});
/****************************************** remove functions ***********************************/

function removeSummary() {
    $("#summary .inner-table >tbody >tr + tr").remove();   
};

function removeStaticList() {
    $("#static-list table tbody tr").remove();
};

function removeNetList() {
    $("#network table tbody tr").remove();
};

function removeMonitorList () {
    $("#monitoring .inner-table >tbody >tr").remove();
};

/******************************************** hostName functions *********************************/

function getHostInfo( elem ) {
    $.getJSON( "/host/info?hostName=" + elem, function( resp ) {
        $("#summary .inner-table >tbody:nth-child(1)").append("<tr><td>" + resp['model'] + "</td><td>" + resp['CPU'] + "</td><td>" + Number.toInteger(resp['Memory']/1024) + "<span class=\"unit\"> MB <span></td></tr>");
        $("#summary .inner-table >tbody:nth-child(2)").append("<tr><td>" + resp['Speed'] + "</td><td>" + resp['Threads'] + "</td><td>" + resp['Pools'] + "</td></tr>");
        $("#summary .inner-table >tbody:nth-child(3)").append("<tr><td>" + resp['VM'] + "</td><td>" + resp['Networks'] + "</td></tr>");
    });
};

function getStaticList( elem ) {
    $.getJSON("/vm/list/configuration?hostName=" + elem + "&filter=2", function( resp ) {
        var propList = [], str = "";
        var temp;
        
        for( var prop in resp[0] ) {
            if( prop != undefined ) propList.push(prop);
        }
        
        for( var i = 0; i < resp.length ; i++ ){
            str += "<tr>";
            str += "<td>" + (i+1) + "</td>";
            for( var j = 0; j < propList.length ; j++ ) {
                if ( j === 3 ){
                    resp[i][propList[j]] /= 1024;
                    str += "<td>" + resp[i][propList[j]] + "<span class=\"unit\"> MB <span>" + "</td>";
                }
                else {
                    str += "<td>" + resp[i][propList[j]] + "</td>";
                }
            }
            str += "</tr>";
        }
        
        $("#static-list table tbody").append(str);
    });
};

function getStorageList (elem) {
    console.log(elem);
    $(".storage-list > li").remove();
    $.ajax({
        url: "/storage/pool/list",
        type: "GET",
        data: { "hostName": elem, "filter": "2" },
        dataType: "json",
        success: function (pools) {
            for (var i = 0; i < pools.length; i++) {
                var str = "<li id=\"pool" + i + "\"><div class=\"p-head\"><i class=\"fa fa-caret-right fa-caret-down\"></i><span>" + pools[i].Name + "</span></div><ol style=\"display: none\"></ol></li>";
                $("#storage-bar > ol.storage-list").append(str);  
                $.ajax({
                    url: "/storage/vol/list",
                    type: "GET",
                    data: { "hostName": elem, "poolName": pools[i].Name, "filter": "2" },
                    dataType: "json",
                    context: $('#pool' + i),
                    success: function (vols) {
                        var str = "";
                        var circle_id = "";
                        var temp_number = 0;
                        
                        console.log(vols);
                        for (var j = 0; j < vols.length; j++) {
                            circle_id = $(this).attr('id') + j;
                            console.log(circle_id);
                            str = "<li class=\"v-head\"><span>" + vols[j].Name + "</span><div id=\"" + circle_id +"\" class=\"circles\"></div>" + "</li>";
                            $(this).find('ol').append(str);
                            temp_number = vols[j].Allocation;
                            Circles.create({
                                id: circle_id,
                                percentage: temp_number,
                                radius: 20,
                                width: 6,
                                number: temp_number,
                                text: '',
                                colors: ['#aaa', '#aaf'],
                                duration: null
                            });
                            $(this).find(".circles").qtip({
                                content: {
                                    text: "<ul style=\"margin: 0 0 0 0\"><li>Capacity: " + vols[j].Capacity + "<span class=\"unit\"> MB </span></li></ul"
                                }
                            });
                        }
                    },
                    error: function (xhr, resp) {
                        alert("error while getting volume list");
                    }
                });
            }
        },
        error: function (xhr, resp) {
            alert("error while getting pool list");
        }
    });
};

function getNetList(elem){
   
    $.ajax({
		url: "/network",
		type: "GET",
		dataType: 'json',
        
		success: function (json) {
			$("#network table tbody").remove();
			var str = "<tbody>";
           
            var propList = [];
        
        for( var prop in json[0] ) {
            if( prop != undefined ) propList.push(prop);
        }    
			for( var i = 0; i < json.length ; i++ ) {
                 console.log("Bind successful");
				
				for( var j = 0; j < propList.length ; j++ ) {
                str += "	<td>"+json[i][propList[j]]+"</td >";
                
                }
                
                str += "<td><a href=\"#addvm\"><button id=\""+json[i][propList[0]]+"\" class=\"button-vm pure-button\" href=\"#addvm\"><span style=\"font-style:bold\">Add VMs</span></button> </a>  </td>";

				str+="	</tr>";
				

		}
		str+="</tbody>";
		$("#net").append(str);
        
        },
	error: function (xhr, status) {
		alert("sorry there was a problem!");
	},
})
};

function getMonitorList (elem) {
    $.ajax({
        url: '/vm/list/runtime',
        type: 'GET',
        data: {"hostName": hostName[0]},
        dataType: 'json',
        success: function (resp) {
            console.log(resp);
            for (var i = 0; i < resp.length; i++) {
                var str = "<tr><td>" + (i+1);
                str += "</td><td>" + resp[i]['name'];
                str += "</td><td>" + resp[i]['Persistant'];
                str += "</td><td><div class=\"chart-container\" id=\"vm-" + (i+1);
                str += "\"></div></td></tr>";
                console.log($("#monitoring .inner-table >tbody").append(str));
                var options = {
                    "chart": {
                        "type": "line",
                        "width": 325,
                        "height": 200,
                        "spacingTop": 15,
                        "spacingBottom": 10,
                        "spacingLeft": 5,
                        "spacingRight": 10
                    },
                    "title": {
                        "text": null
                    },
                    "xAxis": {
                        "title": {
                            "text": null
                        },
                        "tickInterval": 3
                    },
                    "yAxis": {
                        "title": {
                            "text": null
                        },
                        "min": 0,
                        "max": 100
                    },
                    "legend": {
                        "enabled": false
                    },
                    "tooltip": {
                        "enabled": false
                    },
                    "exporting": {
                        "enabled": false
                    },
                    "credits": {
                        "enabled": false
                    },
                    "series": [{
                        "index": 1,
                        "marker": {"enabled": false},
                        "name": "cpu",
                        "type": "spline",
                        "data": resp[i]['cpu'],
                    },
                    {   
                        "index": 0,
                        "marker": {"enabled": false},
                        "name": "memory",
                        "type": "spline",
                        "data": resp[i]['memory']
                    }]
                };
                $('#vm-' + (i+1)).highcharts(options);
            }
        },
        error: function (xhr, status) {
            alert(status);
        }
    });
};

/********************************* selectable event handlers *******************************/

$("#selectable").selectable({
    selected: function( event, ui ) {
        var str = $(ui.selected).text();
        
        if( hostName.indexOf(str) == -1 )
            hostName.push(str);
    },
    
    unselected: function( event, ui ) {
        var str = $(ui.unselected).text();
        
        if( hostName.indexOf(str) != -1 )
            hostName.pop(str);
    }
});

/*************************** Add the tabbing event handlers here********************************/
$("#inner-content").tabs({
    active: 0,
    activate: function( event, ui ) {
        var newTab = $(ui.newTab).attr("id"), oldTab = $(ui.oldTab).attr("id");
        $(ui.newTab).addClass("tab-select");
        $(ui.oldTab).removeClass("tab-select");
        
        if( newTabFunctions[newTab] )
            newTabFunctions[newTab]();
        
        if( oldTabFunctions[oldTab] )
            oldTabFunctions[oldTab]();
    },
});

/***************************** get sidebar host list **********************************************/
$.ajax({
    url: "/host/list",
    type: "GET",
    dataType: 'json',
    success: function (json) {
        var i = 0;
        var str = "";
        var str1 = "";
        while (json[i++]) {
            str += "<li class=\"ui-widget-content\">" + json[i - 1] + "</li>";
            if (!json[i + 1]) {
				str1 += "<option value='" + json[i - 1] + "'>" + json[i - 1] + "</option>";
            }
            $("#net-host").append(str1);
            $("#selectable").append(str);
        }
    },
    error: function (xhr, status) {
        alert("sorry there was a problem!");
    }
});

/**************************** VMs table selection ************************************************/

$("#static-list table.inner-table > tbody").on("click", "tr", function( event ) {
    $(".vm-row-selected").removeClass("vm-row-selected");
    $( this ).addClass("vm-row-selected");
    console.log("row selected");
});


/**************************** Network table selection ************************************************/

$("#network table.inner-table > tbody").on("click", "tr", function( event ) {
    $(".net-row-selected").removeClass("net-row-selected");
    $( this ).addClass("net-row-selected");
    console.log("row selected");
});


/****************** storage listing ******************************/

$(".storage-list").on("click", "> li > div >i.fa", function (event) {
    $(this).parent().siblings("ol").slideToggle();
    $(this).parent().find("i").toggleClass("fa-caret-right");
});

$(".storage-list").on("click", ">li >div >span", function (event) {
    $(".storage-row-selected").removeClass("storage-row-selected");
    $(this).parent().addClass("storage-row-selected");
});

$(".storage-list").on("click", " ol >li", function (event) {
    $(".storage-row-selected").removeClass("storage-row-selected");
    $(this).addClass("storage-row-selected");
});

/********************* monitoring ********************/

$("#monitoring .inner-table").on("click", ">tbody >tr", function () {
    $(".vm-monitoring-row-selected").removeClass(".vm-monitoring-row-selected");
    $(this).addClass("vm-monitoring-row-selected");
});


/***************************** ajax event handlers *********************/
/******** note **********
$(document).ajaxStart( function( event ) {
    console.log("ajax query start");
});

$(document).ajaxStop( function( event ) {
    console.log("ajax query ends");
});


1. ajaxStart is triggered when an ajax query starts and it is not triggered for all until all the pending queries
have been completed

2. ajaxStop is triggered when no other ajax queries are pending

3. ajaxSend is triggered when any ajax quey is about to be sent

4. ajaxComplete is triggered when any ajax query reaches completion

Google like footnotes to be implemented using this.
**********************/

/*********************Create vm ****************************/
$('#vm-form').on("submit",function () {
    var VMParam = {
        name: document.getElementById("vm-name ").textContent,
        vcpu:document.getElementById("vcpu").value,
        os: document.getElementById("os").value,
        bootdev: document.getElementById("bootdev ").value,
        memory: document.getElementById("ram ").value
    };
    console.log(VMParam);
	$.ajax({
		url: '/vm/create',
		type: 'POST',
		contentType: 'application/json',
		//datatype: 'json',
		data: 'VMParam',
		success: function (data, textStatus, jqXHR) {
			alert("VM Created Succesfully !! ");
			
		},
		error: function (xhr, status) {
			alert("	Sorry VM can not be created!");
		},
	})
});

$('#network-form').on("submit",function () {
//event.preventDefault();
    var NetParam = {
	name: document.getElementById("name").textContent,
	host:document.getElementById("net-host").value,
	mode: document.getElementById("mode").value,
	bridgename: document.getElementById("bridgename").textContent,
	dev: document.getElementById("dev ").value,
	ipv: document.getElementsByName("ipv ").textContent,
	addrstart: document.getElementById("addrstart").textContent,
	addrend: document.getElementById("addrend").textContent,
	autostart: document.querySelector('#autostart:checked').value
};
    console.log(NetParam);
	$.ajax({
		url: 'network/create',
		type: 'POST',
		contentType: 'application/json',
		//datatype: 'json',
		data: 'NetParam',
		success: function (data, textStatus, jqXHR) {
			alert("Network Created Succesfully !! ");
			
		},
		error: function (xhr, status) {
			alert("	Sorry Network can not be created!");
			
		},
	})
});

