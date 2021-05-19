/** 
 * Event Drops timeline
 */

var global = global || window;
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

var scale = 1.0;
var clickScale = 2.0;

var dictEventos = {}

var zoomTL = d3.zoom()
    //.scale(scale)
    .scaleExtent([1, 5])
    .on("zoom", zoomed);

//var width = $('#eventdrops-timeline').width()

var container, vx, vy, vw, vh, defaultView;


var es_ES = {
  "decimal": ",",
  "thousands": ".",
  "grouping": [3],
  "currency": ["€", ""],
  "dateTime": "%a %b %e %X %Y",
  "date": "%d/%m/%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  "shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
  "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
};

var colorAge = {
  "2017" : '#4e73df',
  '2018' : '#fd7e14',
  '2019' : '#1cc88a',
  '2020' : '#e74a3b'
}
//var ES = 
//d3.timeFormatDefaultLocale(es_ES);


// date formate and parse
let parseDate = d3.timeParse("%Y-%m-%d %H:%M")
let formatDate = d3.timeFormat("%e-%b-%Y %H:%M")

var tip2 = d3.tip().attr('class', 'd3-tip')
  .html(function (d) {
    //console.log(d)
    var html = `<div class="d-flex flex-column" id="tooltip">
                <strong class="p-1 textTip"><span style="color: #1375b7" >${d.name}</span></strong>
                <span class="p-1"><span style='text-transform:capitalize' >${d.fecha}</span></span>
        </div>`;
    return html
});


const chartDrop = eventDrops({
  range: {
    start: new Date('05/14/2017 11:27:00 AM'),
    end: new Date('11/14/2020 ')
  },
  drop: {
    date: d => d.fecha,
    id : d => d.numeroId,
    color: d=> colorAge[d.anio],
    onClick: d => {
      //console.log(`Sesion ${d.sesId}  de ${d.name} has been clicked!`);
      let id = 'b' + d.sesId
      getIdSes(id)
    },
    onMouseOver: d => {
      //console.log(`Data ${d.id} has been Mouseover!`);
      tip2.show(d)
    },
    onMouseOut: d => {
      //console.log(`Data ${d.id} has been out`);
      tip2.hide()
    },
  },
  line: {
    color: d=> {
      console.log('color line:', d)
      return colorAge[d.data[0].anio]
    },
  },
  margin: {
    top: 20,
    right: 10,
    bottom: 20,
    left: -20,
  },
  axis: {
    formats: {
        milliseconds: '%L',
        seconds: ':%S',
        minutes: '%I:%M',
        hours: '%I %p',
        days: '%a %d',
        weeks: '%b %d',
        months: '%B',
        year: '%Y',
    },
    verticalGrid: false,
    tickPadding: 10,
  },
  zoom: {
    onZoomStart: e => {
      console.log('start:', e)
    },
    onZoom: e => { console.log( 'on:', e)},
    onZoomEnd: e => { 
      console.log( 'end:', e)
      var transform = d3.zoomIdentity;
  console.log("trans:", transform, transform.translate)
    },
    minimumScale: 1,
    maximumScale: Infinity,
  },
});


function createTimelineEvent(){
  let sesionesList = Object.values(sesiones) 
  console.log(sesionesList)

  let newList = [... sesionesList]

  newList.map( d=> {
    let vot = d 
    let fechacompleta = vot.fecha + ' ' + vot.hora
    let fecha = formatDate(parseDate(fechacompleta))

    //console.log(fecha)
    //parseDate(fechacompleta)
    vot.fecha = parseDate(fechacompleta)
    return vot
  })


  console.log(newList)
  
  let v2017 = newList.filter(v => v.anio == '2017')
  //console.log('v2017:', v2017)
  let v2018 = newList.filter(v => v.anio == '2018')
  //console.log('v2018:', v2018)
  let v2019 = newList.filter(v => v.anio == '2019')
  //console.log('v2019:', v2019)
  let v2020 = newList.filter(v => v.anio == '2020')
  console.log('v2020:', v2020)
  

  const repositoriesData = [{
    name: 'Votaciones 2017',
    data : v2017
  },{
    name:  'Votaciones 2018',
    data: v2018
  },{
    name:  'Votaciones 2019',
    data: v2019
  },{
    name:  'Votaciones 2020',
    data: v2020
  }

  ]

  let divTimeline = d3.select('#eventdrops-timeline')
    .data([repositoriesData])
    //.call(eventDropsChart);
    .call(chartDrop)

  let svgTimeline = divTimeline.select('svg')
    //.attr('width', width)
    .call(tip2)

  console.log("CHART:", svgTimeline, divTimeline[0])

  let alldrops = d3.selectAll('.drop')
  
  console.log("drops:", alldrops)

  getPosSvg()
  
  d3.selectAll('.drop').each(function(d, i) {
    d.cx = d3.select(this).attr('cx')
    console.log("element:", i, d)
    d3.select(this).attr('id', 'n'+d.sesId)
    console.log(this, d3.select(this).attr('cx') )  
    dictEventos[d.sesId] = 1
  });

}


function searchVote(id){
  console.log("vote:", id)

  var node = d3.select('#n'+id);
  console.log("evento:", node)
  console.log("dictEv:", dictEventos[id])

  console.log()
  container.transition().call(zoomTL.scaleBy, 1)

  var transform = d3.zoomIdentity;
  console.log("trans:", transform, transform.translate)

  //var transform = getTransform(node, clickScale);
  //console.log("trans:", transform, transform.translate)
//
  //container.transition().duration(1000)
  //   .attr("transform", "translate(" + transform.translate + ")");
}

function getTransform(node, xScale) {
  var bbox = node.node().getBBox();
  console.log(bbox)
  var bx = bbox.x;
  var by = bbox.y;
  var bw = bbox.width;
  var bh = bbox.height;
  var tx = -bx*xScale + vx + vw/2 - bw*xScale/2;
  var ty = -by*xScale + vy + vh/2 - bh*xScale/2;
  return {translate: [tx, ty], scale: xScale}

}

function getPosSvg(){
  container = d3.select('#eventdrops-timeline').select('svg')
  var bbox = container.node().getBBox();
  console.log("Container:", container)
  vx = bbox.x;		// container x co-ordinate
  vy = bbox.y;		// container y co-ordinate
  vw = bbox.width;	// container width
  vh = bbox.height;	// container height
  defaultView = "" + vx + " " + vy + " " + vw + " " + vh;
  console.log(vx,vy,vw,vh)

  container.attr("viewBox", defaultView)

}


function zoomed() {

}