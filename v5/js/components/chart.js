/*
 *    chart.js
 *    Componente del grafico de entidades que contendra toda la info de sus funcioens
 */

console.log("Tam:", width)

let durationRect = 500


/** D3 html  */
const svg = d3.select("#chart").append("svg")
  .attr("viewBox", [-width / 2, (-height / 2) - 25, width+50 , height])
  .attr("width", width) // + margin.left + margin.right)
  .attr("height", height) // + margin.top + margin.bottom)
  .attr("ondrop", "drop(event)")
  .attr("ondragover", "allowDrop(event)")
  .append("g")
  .attr("transform", "translate(" + (-width/2 -50) + "," + (-height / 2  -50 ) + ")");

//Elementos del svg 
let g = svg.append("g").attr('id','group')
let rect = g.selectAll("rect")
let texts = g.selectAll("text")
let lines = g.selectAll("polyline")


/**
 * <span class="p-1"><span style='text-transform:capitalize' >Asambleista ${d.tipo == 'nacional' ? d.tipo : ` por ${d.provincia}` }</span></span>
                <span class="p-1"><span style='text-transform:capitalize' >Voto: ${ d.voto }</span></span>
                <span class="p-1"><span style='text-transform:capitalize' >Partido: ${ d.partido }</span></span>
                <span class="p-1"><span style='text-transform:capitalize' > ${ (d.comisiones.length >0 ? d.comisiones[0].comision : ' ') }</span></span>
 */
let tip = d3.tip().attr('class', 'd3-tip')
  .html(function (d) {
    //console.log(d)
    let html = `<div class="d-flex flex-column" id="tooltip">
                <strong class="p-1 textTip"><span style="color: #1375b7" >${d.nombre}</span></strong>
                <span id="asambTip" class="p-1" style="display: none;"><span style='text-transform:capitalize' >Asambleista ${d.tipo == 'nacional' ? d.tipo : ` por ${d.provincia}` }</span></span>
                <span id="votoTip" class="p-1" style="display: none;"><span style='text-transform:capitalize' >Voto: ${ d.voto }</span></span>
                <span id="partidoTip" class="p-1" style="display: none;"><span style='text-transform:capitalize' >Partido: ${ d.partido }</span></span>
              </div>`;
    return html
  })
  .offset([-12, 0]);
svg.call(tip);


var menu = [
  {
    title: 'Resaltar',
    action: function(elm, d, i) {
      console.log('Resaltar');
      console.log(d);

      if(d.labelFlag == false){
        console.log("no visitado")
        d3.select("#node"+d.numeroid).attr("stroke", "orange").attr("stroke-width", 3.0)
        d3.select('#text'+ d.numeroid).attr("visibility", "visible")
        d.labelFlag = true
      }
      else {
        d3.select("#node"+d.numeroid).attr("stroke", "#fff").attr("stroke-width", 0)
        d3.select('#text'+d.numeroid).attr("visibility", "hidden")
        d.labelFlag = false
      }
      

    }
  },
  {
    title: 'Eliminar',
    action: function(elm, d, i) {
      console.log(elm, d, i)
      console.log('Eliminar!');
      console.log(d);
      removeEntityChart(d.numeroid)
    }
  }
]


function initChart(){
  testChart()
}


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
  //updateInfoChart(sesiones[currentSes])

  //updateTable(nodes)

  //chart()
  //sortFunction(nodosActuales)
  ////ListEntitys(nodosActuales)
  
  console.log("Nodos Actuales :", Object.values(nodosActuales).length ,nodosActuales)
  console.log("entidades: ", Object.values(entidades).length, entidades)
  console.log("newnodes: ", Object.values(newnodos).length, newnodos)
  //console.log("Nodes:", nodes)
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
        entidades[_asamb.id].xOffset = width/2
        entidades[_asamb.id].yOffset = 300
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

function updateChart(id, doNotAnimate){
  resetFlags()
  let data = sesiones[id]
  currentSes = id
  groups = _groups()
  let newnodos = updateSesion(data)
  nodes = createNodes(newnodos, groups)

  updateInfoChart(data)

  //initializeList(nodosActuales)
  sortFunction(nodosActuales)
  d3.timeout(chart(doNotAnimate), 500)
  //updateTable(nodes)
}

function chart(doNotAnimate) {
  // rects for each node.
  if(doNotAnimate)
    durationRect = 1

  rect = rect
    .data(nodes, d=> d.id)
    .join(
      enter => enter.append("rect")
                    .attr("class", "rect")
                    .attr("x", d => d.xOffset)
                    .attr("y", d => d.yOffset)
                    .attr("width", rectSize)
            .attr("height", rectSize)
            .attr("rx", 2)
            //.attr("opacity", 0)
            .attr("ry", 2)
            .attr("fill", d => color(d, colorMap))
            .attr("stroke", "orange")
            .attr("stroke-width", d => d.labelFlag ? 3.0 : 0)
    
          .call( enter => enter.transition().delay(300).duration(durationRect+200)//.delay(80)
            .attr("id", d=> {
              console.log("Enter rect ", d.id)
              return d.id })
            .attr("x", d => d.x)//Offset)
            .attr("y", d => d.y)//Offset)
            //.attr("opacity", 1 )
            .attr("width", rectSize)
            .attr("height", rectSize)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("fill", d => color(d, colorMap))
            .attr("stroke", "orange")
            .attr("stroke-width", d => d.labelFlag ? 3.0 : 0))
          
          .call( enter => enter.select('rect').transition().duration(30)
            .attr("x", d => d.x)
            .attr("y", d => d.y))
          
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)),
          
      update => update.transition().delay(300).duration(durationRect+200)
          .attr("stroke-width", d => d.labelFlag ? 3.0 : 0)
          .attr("x", d => d.x)
          .attr("y", d => d.y)
          .attr("width", rectSize)
          .attr("height", rectSize)
          .attr("fill", d => {
            console.log("update ", d.id)
            return color(d, colorMap)
          })
          ,
      exit => exit.transition()
                  .delay(100)
                  .duration(durationRect+200)
                  .attr("x", d => d.x + 25)
                  .attr("y", d => d.y + 50)
                  .attr("width", 35 - 50)
                  .attr("height", 35 - 100)
                  .remove()
    )
    
  rect.on("mouseover", d=> mouseOverRect(d)).on("mouseout", d=> mouseOutRect(d))

  rect.on('contextmenu', d3.contextMenu(menu));

  //rect.on('contextmenu', d3.contextMenu(menu, {
	//	onOpen: function() {
	//		console.log('Quick! Before the menu appears!');
	//	},
	//	onClose: function() {
	//		console.log('Menu has been closed.');
	//	}
	//})); // attach menu to element

  texts = texts
    .data(nodes, d=> d.id)
    .join("text") 
    .attr('visibility', d=> d.labelFlag ? 'visible' : 'hidden' )
    .attr("class", "labeltext")
    .attr('id', d=> 'text'+d.numeroid)
    .text(d=> d.nombre)
    //.transition().ease(d3.easeSinOut).duration(500)
    .attr('x', d=> d.x + 20)//+ d.vx * .0135)
    .attr('y', d => d.y -20 ) // + d.vy * .0135)

  //createLabels()

  // Group name labels
  svg.selectAll('.grp')
    .data(d3.keys(groups))
    .join("text")
    .attr("class", "grp") //clase para editar los textos
    .attr("text-anchor", "middle")
    .attr("font-size", "1rem")
    .attr("x", d => groups[d].x)
    .attr("y", d => groups[d].y - 50)
    .text(d => groups[d].fullname + ' ('+groups[d].cnt+')' );
  
}

function createLabels(){
  
  let labelRightBounds = [];
  let labelBelow = 1
  let labelLeft = -100
  let barHeight = 1

  texts = texts
    .data(nodes, d=> d.id)
    .join("text")
    .attr("class", "labeltext")
    .text((d, i) => d.nombre)
    .attr("x", d => {
      console.log(d.x, d)
      return d.x +20
    })
    .attr("y", function(d) {
        labelRightBounds.push([this.getBBox().x, this.getBBox().width]);
        return d.y - 20//2 * labelBelow;
    })
    .attr("alignment-baseline", "bottom")


  let labelHeights = []
  let prevRightBound = -labelLeft

  console.log("Rigth bounds:", labelRightBounds)

  for (let i in labelRightBounds) {
    if (labelRightBounds[i][0] < prevRightBound + labelLeft) {
        labelRightBounds[i][0] = prevRightBound + labelLeft;
        labelHeights[i - 1] -=1;
        labelHeights.push(-2);
    } else {
        labelHeights.push(-2)
    }
    prevRightBound = labelRightBounds[i][0] + labelRightBounds[i][1]
  }
  
  console.log("label height:", labelHeights)

  function getLabelHeight(i) {
    if (i == labelRightBounds.length - 1) {
        labelHeights[i] = -2;
        return -2;
    } else if (labelRightBounds[i][0] + labelRightBounds[i][1] + labelLeft > labelRightBounds[i + 1][0]) {
        labelRightBounds[i + 1][0] = labelRightBounds[i][0] + labelRightBounds[i][1] + labelLeft;
        let nextHeight = getLabelHeight(i + 1);
        let thisHeight = nextHeight - 1;
        labelHeights[i] = thisHeight;
        return thisHeight;
    } else {
        getLabelHeight(i + 1);
        labelHeights[i] = -2;
        return -2;
    }
  }

  getLabelHeight(0);

  console.log("label height:", labelHeights)

  lines = lines
    .data(nodes, d=> d.id)
    .join("polyline")
    .attr("class", "sota-stackedBarChart-label-aboveBar-line")
    .attr("points", (d, i) => {
        let x1 = d.x + 20
        let y1 = barHeight / 2;
        let x2 = x1;
        let y2 = (labelHeights[i] + 1) //* labelBelow;
        let x3 = labelRightBounds[i][0] + labelRightBounds[i][1];
        let y3 = y2;
        return `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
    })
    .attr("stroke-width", 3)
    .attr("stroke", "black")
    .attr("fill", "none")

  texts = texts
    .data(nodes, d=> d.id)
    .join("text")
    .attr("x", (d, i) => labelRightBounds[i][0])
    .attr("y", (d, i) => labelHeights[i] * labelBelow);

}

// Create node data.
createNodes = (nodos, groups) => {

  let nodes = []

  let votoNo = nodos.filter(nodo => nodo.voto == "no")
  let votoBla = nodos.filter(nodo => nodo.voto == "blanco")
  let votoAbs = nodos.filter(nodo => nodo.voto == "abstencion")
  let votoSi = nodos.filter(nodo => nodo.voto == "si")
  let votoAus = nodos.filter(nodo => nodo.voto == "ausente")

  sortByOptionVotes(votoNo, votoBla, votoAbs, votoSi, votoAus)  

  pointsForMatrix(votoNo, groups, nodes, "no")
  pointsForMatrix(votoBla, groups, nodes, "bla")
  pointsForMatrix(votoAbs, groups, nodes, "abs")
  pointsForMatrix(votoSi, groups, nodes, "si")
  pointsForMatrix(votoAus, groups, nodes, "aus")

  console.log("Create for votes:", nodes)
  return nodes
}

sortByOptionVotes = (votoNo, votoBla, votoAbs, votoSi, votoAus) => {

  colorMap = $('#colores-select').val()

  if(colorMap == "provincia"){
    optionSort = 4
    votoNo.sort((a, b) => (a.provincia > b.provincia) ? 1 : ((b.provincia > a.provincia) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))  
    votoBla.sort((a, b) => (a.provincia > b.provincia) ? 1 : ((b.provincia > a.provincia) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))  
    votoAbs.sort((a, b) => (a.provincia > b.provincia) ? 1 : ((b.provincia > a.provincia) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))
    votoSi.sort((a, b) => (a.provincia > b.provincia) ? 1 : ((b.provincia > a.provincia) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))  
    votoAus.sort((a, b) => (a.provincia > b.provincia) ? 1 : ((b.provincia > a.provincia) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0))) 
    
  }
  else if (colorMap == "region"){
    optionSort = 3
    votoNo.sort((a, b) => (a.region > b.region) ? 1 : ((b.region > a.region) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))  
    votoBla.sort((a, b) => (a.region > b.region) ? 1 : ((b.region > a.region) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))  
    votoAbs.sort((a, b) => (a.region > b.region) ? 1 : ((b.region > a.region) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))  
    votoSi.sort((a, b) => (a.region > b.region) ? 1 : ((b.region > a.region) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))  
    votoAus.sort((a, b) => (a.region > b.region) ? 1 : ((b.region > a.region) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))
  }
  else {
    optionSort = 2
    votoNo.sort((a, b) => (a.partido > b.partido) ? 1 : ((b.partido > a.partido) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))  
    votoBla.sort((a, b) => (a.partido > b.partido) ? 1 : ((b.partido > a.partido) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0) ))  
    votoAbs.sort((a, b) => (a.partido > b.partido) ? 1 : ((b.partido > a.partido) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))  
    votoSi.sort((a, b) => (a.partido > b.partido) ? 1 : ((b.partido > a.partido) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))  
    votoAus.sort((a, b) => (a.partido > b.partido) ? 1 : ((b.partido > a.partido) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0))) 
  }

}

//create points for matrix , and return nodes
pointsForMatrix = (votos, groups, nodes, opc) => {

  let dictM = {}
  let dataset = []
  let count = 0
  
  let sizeVotos = votos.length
  let rowSize = 5
  
  if(sizeVotos > 20)
    rowSize = 7
  if (sizeVotos > 30)
    rowSize = 8
  if (sizeVotos > 40)
    rowSize = 9
  if (sizeVotos > 50)
    rowSize = 10
  if (sizeVotos > 60)
    rowSize = 11

  let size = Math.ceil(sizeVotos/rowSize)
  console.log("Size:", size)

  for(var y = 0; y<size; y++){
    var tempData = [size];
    for(var x = 0; x < rowSize; x++){
        var dataDict =  {
       	  x: x*rectSpaceSize, y: y*rectSpaceSize
        };
        tempData[x] = dataDict
        dictM[count] = dataDict
        count = count +1
    };
    dataset.push(tempData);
  };

  //console.log("Dataset:", dataset)
  //console.log("Dict:", dictM)

  votos.map(function(d,i){
    groups[d.voto].cnt += 1;

    let tmp = groups[d.voto].x
    if(votos.length > 2)
      tmp = groups[d.voto].x  + calculateSpace(opc, votos.length)

    let nodeu = {
      id: "node"+d.numeroId,
      numeroid: d.numeroId,
      x: tmp + dictM[i].x,//Math.random() * (-10 - 60) + (-10),
      y: groups[d.voto].y + dictM[i].y,
      xOffset : d.xOffset,
      yOffset : d.yOffset,
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

    nodes.push(nodeu)
  })
}

updateInfoChart = (sesion) => {
  d3.select("#timecount .Scnt").text(sesion.sesion)
  d3.select("#timecount2 .Vcnt").text(sesion.votacion)

  $("#asunto")[0].innerHTML = sesion.asunto
  $("#fecha")[0].innerHTML = sesion.fecha
  $("#hora")[0].innerHTML = sesion.hora
}



// Drag functions used for interactivity

function dragstarted(d) {
  console.log("No Activate:", !d3.event.active)
  //if (!d3.event.active) //simulation.alphaTarget(0.3).restart();
  d3.select("#"+d.id).classed("dragging", true);
  //d.x = d.x;
  //d.y = d.y;
}

function dragged(d) {
  //console.log("dragged:", d3.event.x)
  //d.x = d3.event.x;
  //d.y = d3.event.y;
  //console.log("D value:", d.x)
  d3.select("#"+d.id).attr("x", d3.event.x).attr("y", d3.event.y)
  if(d3.event.x > width - 30){
    d3.select("svg").style("border-right", "5px solid lightskyblue")
    //d3.select("svg").style("border-right-style", "dashed")
  }
  else if (d3.event.x < 66){
    d3.select("svg").style("border-left", "5px solid lightskyblue")
    //d3.select("svg").style("border-left-style", "dashed")
  }
  else if (d3.event.y < 66){

  }
  else{
    d3.select("svg").style("border-right", "0px solid lightskyblue")
    d3.select("svg").style("border-left", "0px solid lightskyblue")
  }
    
    //d3.select("svg").style("border-right-style", "")
}

function dragended(d) {
  //if (!d3.event.active) //simulation.alphaTarget(0);
  d3.select("#"+d.id).classed("dragging", false);
  console.log("Draggend x :", d3.event.x)
  console.log("Draggend y :", d3.event.y)

  if(d3.event.x > width - 30){
    d3.select("svg").style("border-right", "0px solid lightskyblue")
    //d3.select("svg").style("border-right-style", "none")
    d.x = d3.event.x
    d.y = d3.event.y
    d3.select("#"+d.id).attr("x", d3.event.x).attr("y", d3.event.y)
    console.log("fuera del rango permitido")
    entidades[d.numeroid].visitado = false
    updateChartEntitys()
  }
  else if (d3.event.x < 66){
    d3.select("svg").style("border-left", "0px solid lightskyblue")
    //d3.select("svg").style("border-right-style", "none")
    d.x = d3.event.x
    d.y = d3.event.y
    d3.select("#"+d.id).attr("x", d3.event.x).attr("y", d3.event.y)
    console.log("fuera del rango permitido")
    entidades[d.numeroid].visitado = false
    updateChartEntitys()
  }
  else{
    d3.select("#"+d.id).transition().duration(500)
      .attr("x", d.x).attr("y", d.y)
  }

}



function updateChartEntitys(){
  let newnodes = []
  for (let key in entidades) {
    if(entidades[key].visitado == true) newnodes.push(entidades[key])
  }
  groups = _groups()
  nodes = createNodes(newnodes, groups)
  colorMap = $('#colores-select').val() 

  entityList.innerHTML = ''
  //initializeList(nodosActuales)
  ListEntitys(nodosActuales)
  d3.timeout(chart, 500)
  //updateTable(nodes)
}


mouseOverRect = (d) => {

  
  tip.attr('class', 'd3-tip animate').show(d)
  //tip.show(d)
  let id = '#e'+d.numeroid
  //console.log(d)
  d3.select(id).style("border", "2px solid orange")
  //console.log(d3.select(id))
}

mouseOutRect = (d) => {

  tip.attr('class', 'd3-tip').show(d)
  tip.hide()

  let id = d.numeroid
  d3.select("#e"+id).style("border", "2px solid white")
}

calculateSpace = (opc, size) => {
  let value;
  if(rectSize == 40){
    value = -140
  }
  else if (rectSize == 35){
    value = -120
  }
  else if (rectSize == 30){
    value = -100
  }
  else if (rectSize == 25){
    value = -75
  }
  else {
    value = -75
  }

  if (opc == "si"){
    value = value -20
  }
  else if(opc == "no"){
    if(size > 20)
      value = value +10
    else  
      value = value +20
  }

  return value

}

