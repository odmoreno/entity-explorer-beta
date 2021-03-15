/*
 *    entidades.js
 *    Comparar entidades
 *    ref: https://observablehq.com/@kevin110604/moving-bubble-chart-using-d3-js
 */

/**
 * Data prederteminada
 */ 
var LOG = true
var TEST = true
var margin = {left: 80, right: 20, top: 70, bottom: 100};
var height = 700 //- margin.top - margin.bottom,
var width = 960 //- margin.left - margin.right;
    radius = 8;
    padding = 1; // Space between nodes
    cluster_padding = 5; // Space between nodes in different stages

// Ejemplos
var stages;
var groups;
var people;
var nodes;

var interval;

var currentSes = 0
let sesionid = 0
// Informacion de sesiones
let asambleistas = []
// sesiones del pleno
let sesiones = []
//Entidades seleccionados por el usuario 
let entidades = {}
// nodos seleccionados de las entidades
let nodosEnt = []

// info 
let partidos = []
let regiones = []
let provincias = []

//Mapeo
let partidosId = []
let regionesId = []
let provId = []

//grupos
let partidosG = []
let regionesG = []
let provG = []

//final
let listGroups = []

let codeVotes = {
  "0": "abstencion",
  "1": "ausente",
  "2": "si",
  "3": "no",
  "4": "blanco"
}


//Elementos del buscador
const searchBar = document.getElementById('searchEntity');
const entityList = document.getElementById('entityList');

/** D3 html  */
// The SVG object.
const svg = d3.select("#chart").append("svg")
  .attr("viewBox", [-width / 2, (-height / 2) - 25, width + margin.left + margin.right, height + margin.top + margin.bottom])
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + -width/3 + "," + (-height / 4) + ")");

  //const svg = d3.create("svg")
//  .attr("viewBox", [0, 0, width+40, height+40]);
//Elementos del svg 
let circle = svg.append("g").selectAll("circle")

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
        </div>`;
    return html
});
svg.call(tip);

/*** Datos a cargar */
const promises = [
  d3.csv("data/stages.csv", d3.autoType),
  d3.json("data/info.json"),
  d3.json("data/nodos.json"),
  d3.json("data/data.json")
]

/** Eventos */
$("#searchEntity")
  .on("input", function () {
      //LOG && console.log('On input', this.value)
      //resetFlags()
      let value =  this.value
      findEntities(value)
      //searchSesiones(value)
  })
  .on("click", function () {
      //LOG && console.log('On click', this.value)
      //resetFlags()
      findEntities(this.value)
      //searchSesiones(this.value)
  })

$("#votaciones-slider").ionRangeSlider({
  //    skin: "flat",
      skin: "round",
      min: 0,
      max: 913,
      step: 1,
  //    grid: true,   
      hide_min_max: true,
      onChange: function (data) {
          d3.select(".irs-single")
              .style("left",  ()=> {
                  var left = d3.select(".irs-single").style("left")
                  left = left.split('%')
                  var number =parseFloat(left[0]) + 2
                  return number + "%"
              })
              .call(wrap, 80)
  
          sesionid = data.from
          resetFlags()
          updateChart(sesionid)
      }
  });

$("#play-button")
  .on("click", function(){
      var button = $(this);
      if (button.text() == "Play"){
          button.text("Pause");
          interval = setInterval(step, 3000);            
      }
      else {
          button.text("Play");
          clearInterval(interval);
      }
  })

/**
 * Cargar datos
 */
Promise.all(promises).then(allData => {

  
  let info = allData[1]
  asambleistas = allData[2]
  sesiones = allData[3]

  partidos = info.partidos
  regiones = info.regiones
  provincias = info.provincias

  partidosId = Object.values(partidos)
  regionesId = Object.values(regiones)
  provId = Object.values(provincias)

  LOG && console.log("info", partidosId)
  LOG && console.log("asams", asambleistas)
  //LOG && console.log("votaciones", sesiones)

  updateSlider()
  //createGroups()
  groups = _groups()  

  test()

  let newnodos = updateSesion(sesiones[currentSes])

  nodes = _nodes(newnodos, groups)

  chart()

  
  
  //manageData()
}).catch(err => console.log(err))



_groups = () => {
  const groups = {
    "si": { x: width/6, y: height/6, cnt: 0, fullname: "Si" },
    "no": { x: 3*width/4, y: height/6, cnt: 0, fullname: "No" },
    "ausente": { x: 3*width/4, y: 2*height/3, cnt: 0, fullname: "Ausente" },
    "abstencion": { x: width/6, y: 2*height/3, cnt: 0, fullname: "Abstención" },
    "blanco": { x: width/2, y: height/3, cnt: 0, fullname: "Blanco" },
  };
  return groups
}


function step(){
  // At the end of our data, loop back
  currentSes = (currentSes < 913) ? currentSes+1 : 0
  updateChart(currentSes);
}

chart = () => {

  circle.exit()
        .attr("class", "exit")
        .remove();

  // Circle for each node.
  circle = circle
    .data(nodes, d=> d.id)
    .join(
      enter => enter.append("circle")
          .call( enter => enter.attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 8).attr("fill", d => color(d)) ) 
          .call( enter => enter.transition()
                                .delay((d, i) => i * 5)
                                .duration(500)
                                .attrTween("r", d => {
                                  const i = d3.interpolate(0, d.r);
                                  return t => d.r = i(t);
                                }) )   
          ,
      update => update.transition().ease(d3.easeSinOut).duration(500)
          .attr("cx", d => {
            console.log("update")
            if(d.voto != d.lastvoto) return d.x
          })
          .attr("cy", d => {
            if(d.voto != d.lastvoto) return d.y
          })
          ,
      exit => exit.remove()
    )
  
  circle.on("mouseover", tip.show).on("mouseout", tip.hide)
  //console.log('groups', groups)
  
  // Group name labels
  svg.selectAll('.grp')
    .data(d3.keys(groups))
    .join("text")
    .attr("class", "grp")
    .attr("text-anchor", "middle")
    .attr("font-size", "1rem")
    .attr("x", d => groups[d].x)
    .attr("y", d => groups[d].y - 70)
    .text(d => groups[d].fullname);
  
  // Group counts
  svg.selectAll('.grpcnt')
    .data(d3.keys(groups))
    .join("text")
    .attr("class", "grpcnt")
    .attr("text-anchor", "middle")
    .attr("x", d => groups[d].x)
    .attr("y", d => groups[d].y - 50)
    .text(d => groups[d].cnt);

  simulation.nodes(nodes, d=> d.id)
  
  simulation.on("tick", () => {
    //console.log("Cambio")
    circle
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
  });
  //d3.timeout(timer, 3000)
}

test = () => {
  
  d3.values(asambleistas).map(function(asamb) {
    if(asamb.partido == 'creo' || asamb.partido == 'suma'){
      entidades[asamb.numeroId] = asamb
    }
  })
  console.log("Entidades selecc: ", entidades)

  console.log("total: ",  d3.values(entidades).length)
  
}

updateSesion = (sesion) => {

  let nodosSesion = sesion.nodes
  
  for (let i=0; i<nodosSesion.length; i++){
    let _asamb = nodosSesion[i]
    if(entidades[_asamb.id]){
        entidades[_asamb.id].visitado = true
        entidades[_asamb.id].lastvote = entidades[_asamb.id].voto
        entidades[_asamb.id].voto = codeVotes[_asamb.voto]
        entidades[_asamb.id].curul = _asamb.curul
    }
    //else console.log('No existe', this.id)
  }

  let newnodes = []
  for (let key in entidades) {
    if(entidades[key].visitado == true) newnodes.push(entidades[key])
  }
  //console.log("nodos: ", newnodes)
  return newnodes
}


// Create node data.
_nodes = (nodos, groups) => {
  
  let nodes = []
  nodes = nodos.map(function(d) {
    // Initialize count for each group.
    groups[d.voto].cnt += 1;
    let nodeu = {
      id: "node"+d.numeroId,
      x: groups[d.voto].x + Math.random(), // * (-10 - 60) + (-10),
      y: groups[d.voto].y + Math.random(), // * (-10 - 60) + (-10),
      r: radius,
      voto : d.voto,
      lastvoto : d.lastvote,
      group: d.voto,
      partido: d.partido,
      nombre : d.nombre,
      opacidad: d.opacidad,
      provincia: d.provincia,
      region: d.region,
      tipo: d.tipo,
    }
    //console.log(nodeu)
    return nodeu
  });
  console.log(nodes)
  return nodes
} 


function timer(){
  
  resetFlags()
  currentSes = currentSes + 1
  d3.select("#timecount .Scnt").text(sesiones[currentSes].sesion)
  d3.select("#timecount2 .Vcnt").text(sesiones[currentSes].votacion)

  let newnodos = updateSesion(sesiones[currentSes])

  groups = _groups() 
  nodes = _nodes(newnodos, groups)

  chart()
}

function updateChart(id){
  resetFlags()
  //console.log(sesiones[id].sesion)
  d3.select("#timecount .Scnt").text(sesiones[id].sesion)
  d3.select("#timecount2 .Vcnt").text(sesiones[id].votacion)


  let newnodos = updateSesion(sesiones[id])
  
  groups = _groups() 
  nodes = _nodes(newnodos, groups)
  
  //chart()
  d3.timeout(chart, 800)
}

// Force to increment nodes to groups.
function forceCluster() {
  const strength = .15;
  let nodes;

  function force(alpha) {
    const l = alpha * strength;
    for (const d of nodes) {
      d.vx -= (d.x - groups[d.group].x) * l;
      d.vy -= (d.y - groups[d.group].y) * l;
      if(d.id =="node8") console.log(d.group, d.x, d.y, d.id)
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

  return group;
}

color = (d) => {
  let valueId = partidos[d.partido]
  return colorPartidos(valueId)
}

colorPartidos = (d) => {
  let partidosD = [...new Set(partidosId)]
  const colors = ["#1b70fc", "#158940", "#d50527", "#faff16", "#f898fd", "#24c9d7", "#cb9b64", "#866888", "#22e67a", "#e509ae", "#9dabfa", "#437e8a"]
  let scale = d3.scaleOrdinal().domain(partidosD).range(colors);
  return scale(d)

}

/**Ajustar texto */
function wrap(text) {
  text.each(function () {
      let text = d3.select(this)
      let word = text.text()
      var index = word.indexOf(' ', word.indexOf(' ') + 1);
      var firstChunk = word.substr(0, index);
      var secondChunk = word.substr(index + 1);
      //console.log('1: ', firstChunk)
      //console.log('2: ', secondChunk)
      x = text.attr("x")
      y = text.attr("y") - 15
      if (firstChunk) {
          text.text(null)
          var tspan = text.append("tspan").attr("x", x).attr("y", y).text(firstChunk);
          var tspan1 = text.append("tspan").attr("x", x).attr("y", y + 15).text(secondChunk);
      }

  })
}

// Resetea los valores de visitado de los nodos
function resetFlags() {
  for (let key in entidades) {
      if (entidades[key].visitado == true)
        entidades[key].visitado = false
  }

}

function updateSlider() {
  let slider = $("#votaciones-slider").data("ionRangeSlider");
    slider.update({
        prettify: function (n) {
            var tag = sesiones[n]
            //console.log(tag)
            return "Sesión " + tag.sesion + " Votación " + tag.votacion
        },
        
    });
    
    d3.select(".irs-single")
        .style("left",  ()=> {
            var left = d3.select(".irs-single").style("left")
            left = left.split('%')
            var number =parseFloat(left[0]) + 1.7 
            return number + "%"
        })
        .call(wrap, 80)
}

addEntities = (entity) => {
  
  listGroups = [...entity]
}

loadSesion = (id) => {

}
