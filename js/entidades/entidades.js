/*
 *    entidades.js
 *    Comparar entidades (asambleistas)
 */

 var LOG = true

var margin = {left: 80, right: 20, top: 70, bottom: 100};
var height = 700 //- margin.top - margin.bottom,
var width = 1000 //- margin.left - margin.right;
    radius = 8;
    padding = 1; // Space between nodes
    cluster_padding = 5; // Space between nodes in different stages

/** Data  */

// Informacion de sesiones
let asambleistas = []
let sesiones = []
// info 
let partidos = []
let regiones = []
let provincias = []
let comisiones = []
//Mapeo (Ids de cada partido, region, provincia)
let partidosId = []
let regionesId = []
let provId = []
let comisionesId = []
//grupos
let partidosG = []
let regionesG = []
let provG = []
let comG = [] //comisiones  
//dict de sesiones seleccionadas para la graficas
let idSesiones = {}
//Entidades seleccionados por el usuario 
let entidades = {}
//counters
var currentSes = 0
var interval;
var currentId = 0
// Info ensencial del grafico
var groups;
var nodes;
let nodosActuales ={}
//opciones de mapeo
let colorMap;
let codeVotes = {
  "0": "abstencion",
  "1": "ausente",
  "2": "si",
  "3": "no",
  "4": "blanco"
}
let votesSet = [0, 1, 2, 3, 4]

/**Html alterable */
//Elementos del buscador
const searchBar = document.getElementById('searchEntity');
const entityList = document.getElementById('entityList');
const fechaList = document.getElementById('votaciones-list');
/** D3 html  */
const svg = d3.select("#chart").append("svg")
  .attr("viewBox", [-width / 2, (-height / 2) - 25, width - 100 , height])
  .attr("width", width) // + margin.left + margin.right)
  .attr("height", height) // + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + (-width/2 -50) + "," + (-height / 2) + ")");

//Elementos del svg 
let g = svg.append("g").attr('id','group')
let circle = g.selectAll("circle")
let texts = g.selectAll("text")

let simulation = d3.forceSimulation(nodes)
    .force("x", d => d3.forceX(d.x))
    .force("y", d => d3.forceY(d.y))
    .force("cluster", forceCluster())
    .force("collide", forceCollide())
    .alpha(.09)
    .alphaDecay(0);

var tip = d3.tip().attr('class', 'd3-tip')
  .html(function (d) {
    //console.log(d)
    var html = `<div class="d-flex flex-column" id="tooltip">
                <strong class="p-1 textTip"><span style="color: #1375b7" >${d.nombre}</span></strong>
                <span class="p-1"><span style='text-transform:capitalize' >Asambleista ${d.tipo == 'nacional' ? d.tipo : ` por ${d.provincia}` }</span></span>
                <span class="p-1"><span style='text-transform:capitalize' >Voto: ${ d.voto }</span></span>
                <span class="p-1"><span style='text-transform:capitalize' >Partido: ${ d.partido }</span></span>
                <span class="p-1"><span style='text-transform:capitalize' > ${ (d.comisiones.length >0 ? d.comisiones[0].comision : ' ') }</span></span>
        </div>`;
    return html
});
svg.call(tip);

//CREACION DE TABLAS
let table = d3.select("#dataTable")
var thead = table.append('thead').append('tr')
thead.append('th').attr('class', 'scope').text("Curul")
thead.append('th').attr('class', 'scope').style("width", "100%").text("Nombre")
thead.append('th').attr('class', 'scope').style("width", "100%").text("Voto")
thead.append('th').attr('class', 'scope').style("width", "100%").text("Partido")
thead.append('th').attr('class', 'scope').style("width", "100%").text("Región")
thead.append('th').attr('class', 'scope').style("width", "100%").text("Suplente")


/*** Datos a cargar */
const promises = [
  d3.json("data/info.json"),
  d3.json("data/nodosE.json"),
  d3.json("data/data.json"),
]

/** Eventos */
$("#searchEntity")
  .on("input", function () {
      let value =  this.value
      findEntities(value)
  })
  .on("click", function () {
      findEntities(this.value)
  })
  
$("#searchVotes")
  .on("input", function () {
      //LOG && console.log('On input', this.value)
      //resetFlags()
      let value =  this.value
      searchSesiones(value)
  })
  .on("click", function () {
      //LOG && console.log('On click', this.value)
      //resetFlags()
      searchSesiones(this.value)
  })

$("#buscarAsamb")
  .on("input", function () {
      let value =  this.value
      buscarAsambleistas(value, nodes)
  })
  .on("click", function () {
      buscarAsambleistas(this.value, nodes)
  })

$("#buscadorAsambleistas")
  .on("mouseleave", function(){
    //console.log("afueraa")
    fueradelbuscador()
  })

$("#play-button")
  .on("click", function(){
      var button = $(this);
      if(Object.keys(idSesiones).length > 0){
        if (button.text() == "Play"){
          button.text("Pause");
          interval = setInterval(step, 2000);            
        }
        else {
            button.text("Play");
            clearInterval(interval);
        }
      }
  })

$("#prev-button")
  .on("click", function(){
      if(Object.keys(idSesiones).length > 0){
        prevSes()
      }
  })

$("#next-button")
  .on("click", function(){
      if(Object.keys(idSesiones).length > 0){
        nextSes()
      }
  })

$('#colores-select').multiselect({
    buttonWidth: '100%',
    onChange: function () {
        //editColorsNodes()
        colorMap = $('#colores-select').val()
        updateChart(currentSes)
    }
  });

$('#dataTable').DataTable({
    "scrollY": "500px",
    "scrollCollapse": true,
    "paging": true,
  });

  $("#fecha-slider").ionRangeSlider({
    skin: "round",
    type: "double",
    min: 0,
    max: 913,
    from: 0,
    to: 8,
    grid: true,
    grid_snap: true,
    from_fixed: false,  // fix position of FROM handle
    to_fixed: false,
    onChange: function(data){
      manageDates(data)
    }
         // fix position of TO handle
});

$("#row-tamanio").ionRangeSlider({
  skin: "round",
  min: 5,
  max: 15,
  from: 8,
  step: 1,
  grid: true,
  hide_min_max: true,
  onFinish: function (data) {
      let numero = data.from
      radius = numero

      if (radius > 8 && radius <=10){
        padding = 5; // Space between nodes
        cluster_padding = 10; // Space between nodes in different stages
      }
      else if (radius > 10){
        console.log('op2')
        padding = 10; // Space between nodes
        cluster_padding = 15; // Space between nodes in different stages
      }
      else {//if(radius == 8){
        padding = 1; // Space between nodes
        cluster_padding = 5; // Space between nodes in different stages
      }
      
      simulation.force("cluster", forceCluster())
                .force("collide", forceCollide())

      chart()
      //d3.timeout(chart, 500)
      
  }
});

/** Carga de datos de las promesas */

Promise.all(promises).then(allData => {

  let info = allData[0]
  asambleistas = allData[1]
  sesiones = allData[2]

  partidos = info.partidos
  regiones = info.regiones
  provincias = info.provincias
  comisiones = info.comisiones

  partidosId = Object.values(partidos)
  regionesId = Object.values(regiones)
  provId = Object.values(provincias)
  comisionesId = Object.values(comisiones)

  LOG && console.log("info", info)
  LOG && console.log("asams", asambleistas) 
  LOG && console.log("votaciones", sesiones)

  manageData()

}).catch(
  err => console.log(err))


function manageData() {
  
  let slider = $("#fecha-slider").data("ionRangeSlider");
    slider.update({
        prettify: function (n) {
            var tag = sesiones[n]
            //console.log(tag)
            return tag.fecha
        },
        
  });

  createGroups()
  testChart()

}

/**Funciones principales */

//Funcion con entidades por defecto agregadas
function testChart(){

  groups = _groups()
  
  d3.values(asambleistas).map(function(asamb) {
    if(asamb.partido == 'creo' || asamb.partido == 'suma'){
      asamb.labelFlag = false
      entidades[asamb.numeroId] = asamb
    }
  })
  console.log("Entidades selecc: ", entidades)
  console.log("total: ",  d3.values(entidades).length)

  let newnodos = updateSesion(sesiones[currentSes])
  nodes = createNodes(newnodos, groups)

  colorMap = $('#colores-select').val() 
  updateInfoChart(sesiones[currentSes])

  updateTable(nodes)

  chart()
  initializeList(nodosActuales)
}

function updateSesion(sesion){
  nodosActuales = {}
  let nodosSesion = sesion.nodes  
  for (let i=0; i<nodosSesion.length; i++){
    let _asamb = nodosSesion[i]
    nodosActuales[_asamb.id] = asambleistas[_asamb.id]
    nodosActuales[_asamb.id].voto = codeVotes[_asamb.voto]
    if(entidades[_asamb.id]){
        entidades[_asamb.id].visitado = true
        entidades[_asamb.id].lastvote = entidades[_asamb.id].voto
        entidades[_asamb.id].voto = codeVotes[_asamb.voto]
        entidades[_asamb.id].curul = _asamb.curul
        //entidades[_asamb.id].labelFlag = false
        nodosActuales[_asamb.id].visitado = true
    }
    //else console.log('No existe', this.id)
  }

  let newnodes = []
  for (let key in entidades) {
    if(entidades[key].visitado == true) newnodes.push(entidades[key])
  }
  
  //console.log("nodos 137: ", nodosActuales)
  //console.log("total: ",  d3.values(nodosActuales).length)
  return newnodes
}

function addSesion(id){
  if (id in idSesiones) {
    LOG && console.log("Esta en uso")   
    return;
  }else {
    idSesiones[id] = sesiones[id]
    addCircle(id)
  }
  
  //let sesionesID = d3.keys(idSesiones)
  //let max = sesionesID[sesionesID.length-1]

  LOG && console.log("Sesiones anadidas:", idSesiones)
  //console.log(sesionesID)
  //console.log(max)
  currentSes = id

  let sesionesID = d3.keys(idSesiones)
  let index = sesionesID.indexOf(currentSes)
  console.log("index:", index, "id:", currentSes)
  currentId = index
  
  addSesionToList(id)

  updateChart(id)
  
}

function updateChart(id){
  resetFlags()
  let data = sesiones[id]
  currentSes = id
  groups = _groups()
  let newnodos = updateSesion(data)
  nodes = createNodes(newnodos, groups)

  updateInfoChart(data)
  
  d3.timeout(chart, 500)

  updateTable(nodes)
}

function chart() {
  // Circle for each node.
  circle = circle
    .data(nodes, d=> d.id)
    .join(
      enter => enter.append("circle")
          .call( enter => enter
                               .attr("id", d=> d.id)
                               .attr("cx", d => d.x)
                               .attr("cy", d => d.y)
                               .attr("r", radius)
                               .attr("fill", d => color(d, colorMap))
                               .attr("stroke", "orange")
                               .attr("stroke-width", d => d.labelFlag ? 3.0 : 0)),
      update => update
          .attr("r", radius)
          .attr("cx", d => {if(d.voto != d.lastvoto) return d.x})
          .attr("cy", d => {if(d.voto != d.lastvoto) return d.y})
          .attr("stroke-width", d => d.labelFlag ? 3.0 : 0)
          .attr("fill", d => color(d, colorMap)) ,
      exit => exit.remove()
    )
    
  circle.on("mouseover", tip.show).on("mouseout", tip.hide)

  //circle.transition()
  //  .delay((d, i) =>  i * 5)
  //  .duration(800)
  //  .attrTween("r", d => {
  //    const i = d3.interpolate(0, d.r);
  //    return t => d.r = i(t);
  //  });

  texts = texts
      .data(nodes, d=> d.id)
      .join("text") 
      .attr('visibility', d=> d.labelFlag ? 'visible' : 'hidden' )
      .attr('id', d=> 'text'+d.numeroid)
      .text(d=> d.nombre)
      //.transition().ease(d3.easeSinOut).duration(500)
      .attr('x', d=> d.x )//+ d.vx * .0135)
      .attr('y', d => d.y ) // + d.vy * .0135)
      

  // Group name labels
  svg.selectAll('.grp')
    .data(d3.keys(groups))
    .join("text")
    .attr("class", "grp")
    .attr("text-anchor", "middle")
    .attr("font-size", "1rem")
    .attr("x", d => groups[d].x)
    .attr("y", d => groups[d].y - 50)
    .text(d => groups[d].fullname + ' ('+groups[d].cnt+')' );
  

  simulation.nodes(nodes, d=> d.id)
  
  simulation.on("tick", () => {
    circle
      .transition()
      .duration(30)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)

    texts.transition().ease(d3.easeSinOut).duration(400)
      .attr("x", d => d.x + 10)//+ d.vx * .0135)
      .attr("y", d => d.y + d.vy * .0135 )
    
    
  });
}


/**Funciones secundarias */

// Force to increment nodes to groups.
function forceCluster() {
  const strength = .15;
  let nodes;

  function force(alpha) {
    const l = alpha * strength;
    //console.log("L:", l, " = ", alpha, strength)
    for (const d of nodes) {
      d.vx -= (d.x - groups[d.group].x) * l;
      d.vy -= (d.y - groups[d.group].y) * l;
      //if(d.id =="node8") console.log(d.group, d.x, d.y, d.id)
    }
  }
  force.initialize = _ => nodes = _;
  
  return force;
}
// Force for collision detection.
function forceCollide() {
  const alpha = 0.2; // fixed for greater rigidity!
  const padding1 = padding; // separation between same-color nodes
  const padding2 = cluster_padding; // separation between different-color nodes
  let nodes;
  let maxRadius;

  function force() {
    const quadtree = d3.quadtree(nodes, d => d.x, d => d.y);
    for (const d of nodes) {
      const r = d.r + maxRadius;
      const nx1 = d.x - r, ny1 = d.y - r;
      const nx2 = d.x + r, ny2 = d.y + r;
      
      quadtree.visit((q, x1, y1, x2, y2) => {
        if (!q.length) do {
          if (q.data !== d) {
            const r = d.r + q.data.r + (d.group === q.data.group ? padding1 : padding2);
            let x = d.x - q.data.x, y = d.y - q.data.y, l = Math.hypot(x, y);
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l, d.y -= y *= l;
              q.data.x += x, q.data.y += y;
            }
          }
        } while (q = q.next);
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    }
  }

  force.initialize = _ => maxRadius = d3.max(nodes = _, d => d.r) + Math.max(padding1, padding2);

  return force;
}
// funcion para obtener grupos
dataGroup = (newnodes, groupMap) => {
  let group;
  if (groupMap == 'region')
      group = Array.from(d3.group(newnodes, d=> d.region))
  else if (groupMap == 'partido')
      group = Array.from(d3.group(newnodes, d=> d.partido))
  else if (groupMap == 'provincia')
      group = Array.from(d3.group(newnodes, d=> d.provincia))
  else if (groupMap == 'voto')
      group = Array.from(d3.group(newnodes, d=> d.voto))
  else if (groupMap == 'comision')
      group = Array.from(d3.group(newnodes, d=> {
        if(d.comisiones.length > 0){
          //console.log(d.comisiones[0].comision)
          return d.comisiones[0].comision
        }
        else{
          return ""
        }
      } ))

  return group;
}
//Function para crear los grupos de todos los asambleistas y usarlos en el buscador.js 
createGroups = () => {
  let list = Object.values(asambleistas)
  partidosG = dataGroup(list, 'partido')
  regionesG = dataGroup(list, 'region')
  provG = dataGroup(list, 'provincia')
  comG = dataGroup(list, 'comision')

  LOG && console.log('Cluster Part: ', partidosG)
  LOG && console.log('Cluster Reg: ', regionesG)
  LOG && console.log('Cluster Prov: ', provG)
  LOG && console.log('Cluster Comision: ', comG)
  
}

getIdSes = (id) =>{
  LOG && console.log("Anadir sesion ", id)
  //resetFlags()
  let newid = id.substring(1)

  addSesion(newid)
}

_groups = () => {
  const groups = {
    "si": { x: width/6, y: height/4, cnt: 0, fullname: "Si" },
    "no": { x: 3.5*width/4, y: height/4, cnt: 0, fullname: "No" },
    "ausente": { x: 3.5*width/4, y: 2*height/3, cnt: 0, fullname: "Ausente" },
    "abstencion": { x: width/6, y: 2*height/3, cnt: 0, fullname: "Abstención" },
    "blanco": { x: width/2, y: height/6, cnt: 0, fullname: "Blanco" },
  };
  return groups
}

// Create node data.
createNodes = (nodos, groups) => {
  
  let nodes = []
  nodes = nodos.map(function(d) {
    // Initialize count for each group.
    groups[d.voto].cnt += 1;
    let nodeu = {
      id: "node"+d.numeroId,
      numeroid: d.numeroId,
      x: groups[d.voto].x + Math.random(), // * (-10 - 60) + (-10),
      y: groups[d.voto].y + Math.random(), // * (-10 - 60) + (-10),
      r: radius,
      voto : d.voto,
      lastvoto : d.lastvote,
      group: d.voto,
      partido: d.partido,
      nombre : d.nombre,
      idnombre : d.id,
      opacidad: d.opacidad,
      provincia: d.provincia,
      region: d.region,
      tipo: d.tipo,
      comisiones: d.comisiones,
      curul: d.curul,
      visitado: d.visitado,
      labelFlag : d.labelFlag
    }
    //console.log(nodeu)
    return nodeu
  });
  //console.log(nodes)
  return nodes
} 

updateInfoChart = (sesion) => {
  d3.select("#timecount .Scnt").text(sesion.sesion)
  d3.select("#timecount2 .Vcnt").text(sesion.votacion)

  $("#asunto")[0].innerHTML = sesion.asunto
  $("#fecha")[0].innerHTML = sesion.fecha
  $("#hora")[0].innerHTML = sesion.hora
}


step = () =>{
  // At the end of our data, loop back idSesiones
  let sesionesID = d3.keys(idSesiones)
  let max = sesionesID[sesionesID.length-1]
  
  currentSes = (currentSes < max) ? sesionesID[currentId] : sesionesID[0] 
  
  $(".cuadradoL.active").removeClass("active");
  d3.select("#c"+currentSes).classed('active', true)

  updateChart(currentSes)
 
  currentId = (currentId < sesionesID.length-1) ? (currentId + 1) : 0

  LOG && console.log("Current Id:", currentId)
  LOG && console.log("sesiones:", sesionesID)

}

nextSes = () => {

  LOG && console.log("sesiones:", idSesiones)
  
  let sesionesID = d3.keys(idSesiones)
  

  let max = sesionesID[sesionesID.length-1]
  LOG && console.log("list:", sesionesID)
  LOG && console.log("max:", max)

  currentId = (currentId < sesionesID.length-1) ? (currentId + 1) : 0
  
  LOG && console.log("sesion antes:", sesionesID[currentId], currentSes < max)
  currentSes = (currentSes < max) ? sesionesID[currentId] : sesionesID[0] 
  
  $(".cuadradoL.active").removeClass("active");
  d3.select("#c"+currentSes).classed('active', true)
  updateChart(currentSes)

  LOG && console.log("Current Id:", currentId)
  LOG && console.log("currentSes:", currentSes)
  
  
}

prevSes = () => {
  LOG && console.log("sesiones:", idSesiones)
  

  let sesionesID = d3.keys(idSesiones)
  let min = sesionesID[0]

  currentId = (currentId > 0 ) ? (currentId - 1) : sesionesID.length-1
  currentSes = (currentSes > min) ? sesionesID[currentId] : sesionesID[sesionesID.length-1] 
 
  $(".cuadradoL.active").removeClass("active");
  d3.select("#c"+currentSes).classed('active', true)
  updateChart(currentSes)

  LOG && console.log("Current Id:", currentId)
  LOG && console.log("currentSes:", currentSes)
  LOG && console.log("list:", sesionesID)
}

/// Resetea los valores de visitado de los nodos
function resetFlags() {
  for (let key in entidades) {
      if (entidades[key].visitado == true)
        entidades[key].visitado = false
  }
}

function updateTable(nodos) {

  nodos.sort((a, b) => (a.curul > b.curul) ? 1 : ((b.curul > a.curul) ? -1 : 0))
  nodos = nodos.filter(n => n.opacidad == 1)

  let table = d3.select("#dataTable")

  //table.select('thead').remove()

  table.select('tbody').remove()
  let tbody = table.append('tbody')
  tbody
          .selectAll('td')
          .data(nodos, d => d.id)
          .join(
                  enter => enter.append('tr')
                      .call(enter => enter.append("td").text(d => d.curul))
                      .call(enter => enter.append("td").text(d => d.nombre))
                      .call(enter => enter.append("td").style("text-transform", "capitalize").text(d => d.voto))
                      .call(enter => enter.append("td").style("text-transform", "capitalize").text(d => d.partido))
                      .call(enter => enter.append("td").style("text-transform", "capitalize").text(d => d.region))
                      .call(enter => enter.append("td").text(d => d.suplente ? 'Si' : "No"))
          ,
                  update => update,
                  exit => exit.remove().transition().duration(500)
          )

  $('#dataTable').DataTable().clear()
  $('#dataTable').DataTable().destroy()
  $('#dataTable').DataTable({
      "scrollY": "500px",
      "scrollCollapse": true,
      "paging": true,
      "order": [[1, 'asc']],
      "language": {
          "url": "shared/datatables/Spanish.json"
      }

  });
  // $('#dataTable').DataTable().columns.adjust()
}

color = (d, option) => {
  console.log("option", option)
  if(option == "partidos"){
    //console.log("COLOR:", d)
    //console.log(partidos)
    //console.log("Color selc:", partidos[d.partido])
      let valueId = partidos[d.partido]
      return colorPartidos(valueId)
  }
  else if (option == "region") {
      let valueId = regiones[d.region]
      return colorRegions(valueId)
  }
  else if ( option == "provincia") {
      //let valueId = provincias[d.provincia.trim()]
      let valueId = provincias[d.provincia]
      return colorProvincias(valueId)
  }
  else if (option == "voto") {
      let valueId = d.voto
      return colorVotos(valueId)
  }
  else if(option == "comisiones") {
    let valueId;
    if(d.comisiones.length > 0) {
      valueId = d.comisiones[0].comision
      //console.log("Comision:", valueId)
    }
    return colorComisiones(comisiones[valueId])
  }
}

colorPartidos = (d) => {
  let partidosD = [...new Set(partidosId)]
  //console.log("colorPArtidos:", partidosD)
  const colors = ["#1b70fc", "#158940", "#d50527", "#faff16", "#f898fd", "#24c9d7", "#cb9b64", "#866888", "#22e67a", "#e509ae", "#9dabfa", "#437e8a"]
  let scale = d3.scaleOrdinal().domain(partidosD).range(colors);
  //console.log(d, scale(d))
  return scale(d)
}

colorRegions = (d) => {
  let regionesD = [...new Set(regionesId)]
  let scale = d3.scaleOrdinal().domain(regionesD).range(d3.schemeCategory10);
  return scale(d)
}

colorProvincias = (d) => {
  let prov = [...new Set(provId)]
  let scale = d3.scaleSequential().domain([0, prov.length-1]).interpolator(d3.interpolateRainbow);
  return scale(d)
}

colorVotos = (d) => {
  let scale = d3.scaleOrdinal().domain(votesSet).range(d3.schemeCategory10);
  return scale(d)
}

colorComisiones = (d) => {
  let com = [...new Set(comisionesId)]
  let scale = d3.scaleSequential().domain([0, com.length-1]).interpolator(d3.interpolateRainbow);
  return scale(d)
}

