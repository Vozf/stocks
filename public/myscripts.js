// $("document").ready(function(){
//   // https://www.quandl.com/api/v3/datasets/WIKI/AAPL.csv?api_key=o1DVmHWPWciMn5WLBU21
//       $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {
//         // Create the chart
//       //  console.log(data);
//         Highcharts.stockChart('container', {


//             rangeSelector: {
//                 selected: 1
//             },

//             title: {
//                 text: 'AAPL Stock Price'
//             },

//             series: [{
//                 name: 'AAPL',
//                 data: data,
//                 tooltip: {
//                     valueDecimals: 2
//                 }
//             }]
//         });
//     });
// })

    var seriesOptions = [],seriesCounter = 0;
    var names =[];

var socket = io();



$(function() {
    
      socket.on('arr', function(msg){
      console.log(msg);
      names=msg;
    seriesOptions=[];
    seriesCounter=0;
     $('#text').attr("placeholder","Updating");
    initiateChart(names);
     
  });
       socket.on('err', function(msg){
        if(msg==="Wrong code"){
            $('#text').attr("placeholder","Wrong Code");
            $('#text').val('');
        }
      console.log(msg);

  });

    $('#send').on("click", function() {
  
        socket.emit('add', $('#text').val());
        $('#text').val('');
        return false;
    });
    $('#delete').on("click", function() {
       
        socket.emit('del', $('#text').val());
        $('#text').val('');
        return false;
    });
    //initiateChart(names);




});

function initiateChart(names){
   
    $.each(names, function(i, name) {
        //https://www.quandl.com/api/v3/datasets/WIKI/AAPL.csv?api_key=o1DVmHWPWciMn5WLBU21
        //$.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=' + name.toLowerCase() + '-c.json&callback=?',    function (data) {
        //$.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/' + name.toLowerCase() + '.csv?api_key=o1DVmHWPWciMn5WLBU21',    function (data) {
        //$.getJSON('https://www.quandl.com/api/v3/datasets/YAHOO/'+name.toLowerCase()+'.json?start_date=2015-01-03&end_date=2015-02-03&order=asc', function(json) {
        $.get(window.location.origin+'/api/' + name.toLowerCase(), function(json) {
            json = JSON.parse(json);
            if(json.dataset!=null)
            console.log((json.dataset.dataset_code));
            else console.log(json);
           // if(json.error==="Wrong code")
            if (json.quandl_error || json.error) return;
            var data = json.dataset.data.map(function(d) {
                return [new Date(d[0]).getTime(), d[4]]
            });


            seriesOptions[i] = {
                name: name,
                data: data
            };

            // As we're loading the data asynchronously, we don't know what order it will arrive. So
            // we keep a counter and create the chart when all the data is loaded.
            seriesCounter += 1;

            if (seriesCounter === names.length) {
                createChart(seriesOptions);
                   $('#text').attr("placeholder","Enter your code here");
            }
        });
    });
}

function createChart(seriesOptions) {

    Highcharts.stockChart('container', {

        rangeSelector: {
            selected: 4
        },

        yAxis: {
            labels: {
                formatter: function() {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });
}
