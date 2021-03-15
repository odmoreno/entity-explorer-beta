/*
 *    entidadesTest.js
 *    Comparar entidades
 *    ref: https://observablehq.com/@kevin110604/moving-bubble-chart-using-d3-js
 */

/**
 * Data prederteminada
 */ 
var LOG = true
var TEST = true
var flag = true
var margin = {left: 80, right: 20, top: 70, bottom: 100};
var height = 600 //- margin.top - margin.bottom,
var width = 860 //- margin.left - margin.right;
    radius = 8;
    padding = 1; // Space between nodes
    cluster_padding = 5; // Space between nodes in different stages

// Ejemplos
var stages;
var groups;
var people;
var nodes;
let time_so_far = 0;

// Informacion de sesiones
let asambleistas = []

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

//Elementos del buscador
const searchBar = document.getElementById('searchEntity');
const entityList = document.getElementById('entityList');

/** D3 html  */
// The SVG object.
const svg = d3.select("#chart").append("svg")
  .attr("width", width + 20 + 20)
  .attr("height", height + 20 + 20)
  .append("g")
  .attr("transform", "translate(" + width/4 + "," + 20 + ")");

  //const svg = d3.create("svg")
//  .attr("viewBox", [0, 0, width+40, height+40]);


/*** Datos a cargar */
const promises = [
  d3.csv("data/stages.csv", d3.autoType),
  d3.json("data/info.json"),
  d3.json("data/nodos.json"),
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


/**
 * Cargar datos
 */
Promise.all(promises).then(allData => {

  stages = allData[0]
  //LOG && console.log("stages: ", stages)
  groups = _groups() 
  people = _people()
  nodes = _nodes(people, groups)

  LOG && console.log("groups: ", groups)
  LOG && console.log("people: ", people)
  LOG && console.log("nodes: ", nodes)  

  let info = allData[1]
  asambleistas = allData[2]

  partidos = info.partidos
  regiones = info.regiones
  provincias = info.provincias

  partidosId = Object.values(partidos)
  regionesId = Object.values(regiones)
  provId = Object.values(provincias)

  LOG && console.log("info", info)
  LOG && console.log("asams", asambleistas)

  createGroups()

  chart()

  //manageData()
}).catch(
      err => console.log(err))


function manageData() {
  
}


/**Funciones escenciales de la vista */

_groups = () => {
  const groups = {
    "met": { x: width/5, y: height/3, color: "#FAF49A", cnt: 0, fullname: "Met" },
    "romantic": { x: 3*width/5, y: height/3, color: "#BEE5AA", cnt: 0, fullname: "Romantic" },
    "lived": { x: 3*width/5, y: 2*height/3, color: "#93D1BA", cnt: 0, fullname: "Lived Together" },
    "married": { x: width/5, y: 2*height/3, color: "#79BACE", cnt: 0, fullname: "Married" },
  };
  return groups
}

// Consolidate stages by pid.
// The data file is one row per stage change.
_people = () =>  {
  const people = {};
  stages.forEach(d => {
    if (d3.keys(people).includes(d.pid + "")) {
      people[d.pid + ""].push(d);
    } else {
      people[d.pid + ""] = [d];
    }
  });
  return people
}

// Create node data.
_nodes = (people, groups) => {
  
  let nodes = []
  nodes = d3.keys(people).map(function(d) {
    // Initialize count for each group.
    groups[people[d][0].grp].cnt += 1;
    let nodeu = {
      id: "node"+d,
      x: groups[people[d][0].grp].x + Math.random(),
      y: groups[people[d][0].grp].y + Math.random(),
      r: radius,
      color: groups[people[d][0].grp].color,
      group: people[d][0].grp,
      timeleft: people[d][0].duration,
      istage: 0,
      stages: people[d]
    }
    //TEST && console.log(nodeu)
    return nodeu
  });
  return nodes
} 


chart = () => {
  // Variables.
  console.log("CHART")
  time_so_far = 0;
      
  // ???
  d3.select("#chart").style("width", (width + 20 + 20) + "px");

  // Circle for each node.
  const circle = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("fill", d => d.color);

  // Ease in the circles.
  circle.transition()
    .delay((d, i) => {
      //console.log("Delay:", i * 5)
      return i * 5
    })
    .duration(800)
    .attrTween("r", d => {
      const i = d3.interpolate(0, d.r);
      //console.log("interpolate:", d.r)
      //console.log(i(d.r))
      return t => d.r = i(t);
    });
  
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
  
  // Forces
  const simulation = d3.forceSimulation(nodes)
    .force("x", d => d3.forceX(d.x))
    .force("y", d => d3.forceY(d.y))
    .force("cluster", forceCluster())
    .force("collide", forceCollide())
    .alpha(.09)
    .alphaDecay(0);

  // Adjust position of circles.
  simulation.on("tick", () => {
    console.log("TICK")
    circle
      
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      
    if(!flag){
      circle
      .transition()
      .delay(1000)
      .duration(1500)
        .style("stroke", "black")
        .style("stroke-width", 2)
    }
      //.attr("fill", d => groups[d.group].color);
  });
  
  
  // Start things off after a few seconds.
  d3.timeout(timer, 2000);
  
  //return svg.node()
}

// Make time pass. Adjust node stage as necessary.
function timer() {
  //console.log("Nodos INii:", nodes[7].group)
  nodes.forEach(function (o, i) {
    o.timeleft -= 1;
    if (true) {
      //TEST && console.log("indice", i)
      // Decrease count for previous group.
      groups[o.group].cnt -= 1;
      //TEST && console.log("Groups count init", groups[o.group].cnt)
      // Update current node to new group.
      o.istage += 1;
      o.group = o.stages[o.istage].grp;
      ////TEST && console.log("Group update", o.group)
      o.timeleft = o.stages[o.istage].duration;
      //TEST && console.log("Timeleft final", o.timeleft)
      // Increment count for new group.
      groups[o.group].cnt += 1;
      //TEST && console.log("GROUPS", groups)
    }
  });
  console.log("Nodos Fin:", nodes[7].group, nodes[7].x , nodes[7].y)
  // Increment time.
  time_so_far += 1;
  d3.select("#timecount .cnt").text(time_so_far);
  // Update counters.
  svg.selectAll('.grpcnt').text(d => groups[d].cnt);
  // Do it again.
  if(flag){
    console.log("Cambio en timer")
    d3.timeout(timer, 500);
    flag = false
  }
} // @end timer()


// Force to increment nodes to groups.
function forceCluster() {
  const strength = .15;
  let nodes;

  function force(alpha) {
    const l = alpha * strength;
    for (const d of nodes) {
      d.vx -= (d.x - groups[d.group].x) * l;
      d.vy -= (d.y - groups[d.group].y) * l;
      //if(d.id =="node8") console.log(d.group, d.x, d.y, d.id)
    }
    //console.log("cambio en cluster")
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

createGroups = () => {
  let list = Object.values(asambleistas)
  partidosG = dataGroup(list, 'partido')
  regionesG = dataGroup(list, 'region')
  provG = dataGroup(list, 'provincia')

  //console.log('Cluster Part: ', partidosG)
  //console.log('Cluster Reg: ', regionesG)
  //console.log('Cluster Prov: ', provG)
}