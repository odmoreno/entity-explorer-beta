/**
 * Grafo individual
 * Listado de funciones 
 */

var LOGIND = true
var margin = {left: 80, right: 20, top: 70, bottom: 100};
var height = 700 - margin.top - margin.bottom,
    width = 1200 - margin.left - margin.right;

let g = d3.select("#chart-area")
        .append("svg")
        .attr("viewBox", [-width / 2, (-height / 2) - 25, width + margin.left + margin.right -100, height + margin.top + margin.bottom - 100])
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //.attr("transform", "translate(50, 0)")
        .append("g")
        .attr('id', 'g1')
        .attr("transform", "translate(-150, -120)"); //350, 250

//Circulos de las votaciones individuales
let nodesi = g.append("g")
//.attr("fill", "#fff")
        .attr("id","nodosi")
        .selectAll("circle")

let legendsSvg = d3.select("#legend-area")
    .append("svg")
    //.attr("width", width + margin.left + margin.right)
    .attr("height", "250")

let legends = legendsSvg.append("g")
    .attr("id", "g2")
    .attr("transform", "translate(0, 0)")

let labels = g.append("g")
    .attr('id', 'texto')
    //.style("visibility", "hidden")
    .selectAll("text")

// "translate(" + (- margin.left +20) + ", " + margin.top + ")");
let sup = d3.select("#chart-area svg").append('g')
    .attr("id", "plenosuperiorI")
    .attr("transform", "translate( -300 , -250)")
    .style("display", "none")

let inf =  d3.select("#chart-area svg").append('g')
    .attr("id", "curulI")
    .attr("transform", "translate(-300, -200)")
    .style("display", "none")

let suplentes = d3.select("#curulI")

var modoI = 2

// Tooltip __proto__
//<strong class="p-1 textTip"><span class='ml-2' style='text-transform:capitalize' >curul: ${d.curul}</span></strong>
var tip = d3.tip().attr('class', 'd3-tip')
    .html(function (d) {
        //console.log(d)
        var html = `<div class="d-flex flex-column" id="tooltip">
                    <strong class="p-1 textTip"><span style="color: #1375b7" >${d.nombre}</span></strong>
                    <span class="p-1"><span style='text-transform:capitalize' >Asambleista ${d.tipo == 'nacional' ? d.tipo : ` por ${d.provincia}` }</span></span>
                    <span class="p-1"><span style='text-transform:capitalize' >Voto: ${ codeVotes[d.voto] }</span></span>
            </div>`;
        return html
    });
g.call(tip);


/**Manejador de evento onclick de cualquier sesion individual mostrada en el minimapa */
function viewGraph() {
  
  clearSelection()
  disabledOptions()
  
  //removeAllFilters()
  let sId = d3.select(this).attr("id").substring(1)
  LOGIND && console.log("SesID Grafo Individual: ", sId)
  currentSesId = sId
  graphflag = true
  graphEdit = false

  $(".active").removeClass("active");

  let boxTimeline = d3.select("#c"+sId)
  LOGIND && console.log("Box: ", boxTimeline)
  boxTimeline.classed('active', true)

  //fechaList.innerHTML = ''
  showOptions()

  let data = graphSet[currentSesId]
  console.log("Current GRAPH: ", data)
  LOGIND && console.log("Filtros del grafo individual: ", data.filtersDiv)

  //$("#sesion2")[0].innerHTML = data.sesion.sesion
  //$("#votacion2")[0].innerHTML = data.sesion.votacion
  $("#asunto")[0].innerHTML = data.sesion.asunto
  $("#fecha")[0].innerHTML = data.sesion.fecha
  $("#hora")[0].innerHTML = data.sesion.hora
  showVotacionesBar(data.sesion)

  applyFilters(data)
  //enabledFilter()

  updateGraph(data, false)
  //updateSlider()
}

/**Funcion para mostrar el grafo de un sesion como principal (mas grande) */
function updateGraph(grafo, flag) {

  resetFlags()

  if (flag) {
      grafo.groupMap = $("#grupos-select").val()
      grafo.colorMap = $("#colores-select").val()
      LOGIND && console.log("change:", grafo.groupMap)
  }

  var simulation = grafo.startSimulation(0)
  grafo.wrangleData()
  grafo.updateFilters()

  if(grafo.groupMap == "curul"){
    //LOGIND && console.log("MODO:", grafo.groupMap)
    modoI = 1
    
    deseleccionarLabels()

    updateGroupsofVis(true)
    updatePlenoIndividual(grafo)
    contarGrupos(grafo, grafo.validNodes, grafo.groupMap)
    updateLegends(grafo)
    updateTable(grafo.validNodes)    
  }
  else {
    //LOGIND && console.log("MODO:", grafo.groupMap)
    modoI = 2
    updateGroupsofVis(false)
    updateVisI(grafo, simulation)
  }

  
}

function deseleccionarLabels(){
    d3.select("#texto").style("visibility", "hidden")
    $('#mostrar-leyendas').prop('checked', false);
}

/**Actualizar vista individual */
function updateVisI(grafo, simulation){
  updateNodes(grafo)
  //updateTable(grafo.validNodes)
  //updateGrupos(grafo)

  updateSimulation(simulation, grafo)
  simulation.alphaMin(0.2)
  simulation.velocityDecay(0.4)

  contarGrupos(grafo, grafo.validNodes, grafo.groupMap)

  updateLegends(grafo)

  simulation.on('tick', () => {
      //console.log("Internal:", grafo.sesion.sesId)
      nodesi
              .attr("cx", d => d.x)
              .attr("cy", d => d.y);

      drawClusters(grafo.validNodes, grafo.groupMap)
  })
}



function updateNodes(grafo) {

  grafo.filtersSelect()
  grafo.filterFunction(grafo.validNodes)

  nodesi = nodesi
          .data(grafo.validNodes, d => d.numeroId + 's' + grafo.sesion.sesId)
          .join(
                  enter => enter.append("circle").attr("r", d => 7)
                      .call(enter => enter.transition().duration(500)
                                  .attr('fill', d => grafo.color(d, grafo.colorMap))),
                  update => update.transition().duration(500)
                      .attr('fill', d => grafo.color(d, grafo.colorMap)),
                  exit => exit.remove().transition().duration(500)
          )

  nodesi
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide)
          .style('opacity', d => d.opacidad)

  updateTable(grafo.validNodes)
}


function editColorsInd(grafo){
    resetFlags()
    grafo.groupMap = $("#grupos-select").val()
    grafo.colorMap = $("#colores-select").val()
    LOGIND && console.log("change:", grafo.groupMap)

    updateLegends(grafo)

    //grafo.wrangleData()
    //grafo.updateFilters()

    
    if(grafo.groupMap == "curul"){
        updatePlenoIndividual(grafo)
    }
    else
        updateNodes(grafo)
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
                      .call(enter => enter.append("td").style("text-transform", "capitalize").text(d => codeVotes[d.voto]))
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


function updateLegends(grafo) {
    
  legends.selectAll("g").remove()
  let option = grafo.colorMap

  //contarGrupos(grafo, grafo.validNodes, option)
  
  if(grafo.groupMap == "voto"){updateBarchart(cantidadGrupos, grafo)}

  legends.append("g").attr("transform", "translate(10, -10)")
          .append("text")
          .attr("x", 20)
          .attr("y", 10)
          .attr("text-anchor", "start")
          .style("text-transform", "capitalize")
          .text(option);

  let values = getListLegends(option)
  values[0].forEach(function (element, i) {
      let valueid = element
      if (option != "voto")
          valueid = values[1][element]

      let newEle = getLabel(element, option)
      //console.log("Element:", element)
      //console.log("valuesid:", valueid)
      var legendRow = legends.append("g")
              .attr("transform", () => {
                  if (option == "voto")
                      return "translate(0, " + (i * 35) + ")"
                  else if (option == "provincia")
                      return "translate(0, " + (i * 25) + ")"
                  else if (option == "region")
                      return "translate(0, " + (i * 35) + ")"
                  else if (option == "partidos")
                      return "translate(-45, " + (i * 35) + ")"
              });

      legendRow.append("rect")
              .attr("width", 15)
              .attr("height", 15)
              .attr("fill", () => {
                  if (option == "voto")
                      return grafo.colorVotos(valueid)
                  else if (option == "provincia")
                      return grafo.colorProvincias(valueid)
                  else if (option == "region")
                      return grafo.colorRegions(valueid)
                  else if (option == "partidos")
                      return grafo.colorPartidos(valueid)
              });

              //option == "voto" ? codeVotes[element] : element
      legendRow.append("text")
              .attr("x", 25)
              .attr("y", 14)
              .attr("class", "legendTag")
              .text(option == "voto" ? codeVotes[element] : element)
              .call(wrap, 80);
      
      //legendRow.append("text")
      //        .attr("x", 120)
      //        .attr("y", 10)
      //        .attr("class", "legendTag")
      //        .style("font-weight", "bold")
      //        .text(newEle)
  });

}

function getLabel(element, option){

  //console.log("Element: ", element, option)
  //console.log("cantidad:", cantidadGrupos)
  //let text = (( cantidadGrupos[element]/ 137) * 100).toFixed(2)
  //console.log("Percentage:", text + " %")

  let string;
  if (option == "voto"){
      let valor = cantidadGrupos[element] ? cantidadGrupos[element] : 0
      let text = (( valor/ 137) * 100).toFixed(2)
      //console.log(text)
      //codeVotes[element]  + "  " +
      string =  valor + " (" + text + " %)"
  }
  else if(option === 'region'){
      let region = regiones[element]
      //console.log("Region:", region)
      cantidad = cantidadGrupos[element]
      let text = (( cantidad/ 137) * 100).toFixed(2)
      //element + "  "
      string =  + cantidad + "  (" + text + " %)"
  }
      
  //console.log(string)
  return string
}

function getListLegends(option) {
  let list;
  let dict;
  if (option == "partidos") {
      legendsSvg.attr("height", "420")
      legends.attr("transform", "translate(50, 0)")
      list = Object.keys(partidos)
      dict = partidos
  } else if (option == "region") {
      legendsSvg.attr("height", "200")
      legends.attr("transform", "translate(0, 0)")
      list = Object.keys(regiones)
      dict = regiones
  } else if (option == "provincia") {
      legends.attr("transform", "translate(0, 0)")
      legendsSvg.attr("height", "680")
      list = Object.keys(provincias)
      dict = provincias
  } else if (option == "voto") {
      legendsSvg.attr("height", "170")
      legends.attr("transform", "translate(0, 0)")
      list = votesSet
      dict = codeVotes
  }
  return [list, dict]
}


function drawClusters(nodos, mapOption) {
  let group = {"0": '', "1": '', "2": '', "3": '', "4": '', "5": '', "6": '', "7": '', "8": '', "9": '', "10": '', "11": '', "12": '', "13": '', "14": '',
      "15": '', "16": '', "17": '', "18": '', "19": '', "20": '', "21": '', "22": '', "23": '', "24": '', "25": ''}
  //console.log(nodos)
  nodos = nodos.filter(n => n.opacidad == 1)
  for (let l = 0; l < nodos.length; l++) {
      let n = nodos[l]
      //console.log(n)
      if (n.y) {
          //if(group[n.voto]){}
          //else group[n.voto] = n
          if (mapOption === 'voto') {
              if (group[n.voto]) {
                  //console.log('Existe')
                  if (n.y < group[n.voto].y) {
                      group[n.voto] = n
                      let Nvoto = group[n.voto].voto
                      cantidad = cantidadGrupos[Nvoto]
                      group[n.voto].cantidad = cantidad
                      //console.log("cantidad: ", cantidad)
                      //console.log("group", group[n.voto])
                  }
              } else {
                  group[n.voto] = n
                  group[n.voto].cantidad = 1
              }
                  
          } else if (mapOption === 'region') {
              //group[regiones[n.region]] = n
              if (group[regiones[n.region ]]) {
                  //console.log('Existe')
                  if (n.y < group[regiones[n.region]].y) {

                      group[regiones[n.region]] = n
                      let region = group[regiones[n.region]].region
                      cantidad = cantidadGrupos[region]

                      group[regiones[n.region]].cantidad = cantidad
                  }
              } else{
                  group[regiones[n.region]] = n
                  group[regiones[n.region]].cantidad = 1
              }
          } else if (mapOption === 'partido') {
              if (group[partidos[n.partido]]) {
                  //console.log('Existe')
                  if (n.y < group[partidos[n.partido]].y) {

                      group[partidos[n.partido]] = n
                      let Npartido = group[partidos[n.partido]].partido
                      cantidad = cantidadGrupos[Npartido]
                      //console.log("P: ", n.partido)
                      //console.log("cantidad ", cantidad, " DICT: ", cantidadGrupos)
                      group[partidos[n.partido]].cantidad = cantidad
                  }
              } else {
                  group[partidos[n.partido]] = n
                  let Npartido = group[partidos[n.partido]].partido
                  cantidad = cantidadGrupos[Npartido]
                  group[partidos[n.partido]].cantidad = cantidad
              }
          } else if (mapOption === 'provincia') {
              //group[provincias[n.provincia]] = n
              if (group[provincias[n.provincia]]) {
                  //console.log('Existe')
                  if (n.y < group[provincias[n.provincia]].y) {

                      group[provincias[n.provincia]] = n
                      let Nprov = group[provincias[n.provincia]].provincia
                      cantidad = cantidadGrupos[Nprov]
                      group[provincias[n.provincia]].cantidad = cantidad
                  }
              } else{
                  group[provincias[n.provincia]] = n
                  group[provincias[n.provincia]].cantidad = 1
              }
                  
          } else if (mapOption === 'curul') {
              group = {"0": ''}
          }
      }
  }

  let data = Object.values(group)
  data = data.filter(n => {
      if (n) {
          return n
      }
  })
  //console.log('final: ', data)

  labels = labels
          .data(data, d => d.id)
          .join(
                  enter =>
              enter.append("text").attr("id", d => 'b' + d.curul)
                      .attr("x", d => (d.x))
                      .attr("y", d => d.y)
                      .text(d => optionMap(mapOption, d)) //optionMap(mapOption,d)
                      .style("text-transform", "capitalize")
                      .attr("font-family", "Nunito")
                      .attr("text-anchor", "middle")
                      .attr("font-size", d => textMap(mapOption))
                      .call(wrapLabels),
                  update => update
                      .attr("x", d => d.x)
                      .attr("y", d => d.y - 15)
                      .text(d => optionMap(mapOption, d))
                      .attr("font-size", d => textMap(mapOption))
                      .call(wrapLabels),
                  exit => exit.remove().transition().duration(500)
          );

}

function wrapLabels(text) {
  text.each(function () {
      let text = d3.select(this)
      let word = text.text()
      let words = word.split(" ").reverse()
      var index = word.indexOf(' ', word.indexOf(' ') + 1);
      x = text.attr("x")
      y = text.attr("y")
      var splited = word.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,2}\b/g);
      var split2 = word.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,1}\b/g);
      if (words.length > 3) {
          text.text(null)
          //secondword = splited[1].indexOf( ' ', word.indexOf( ' ' ) + 1 )
          var tspan = text.append("tspan").attr("x", x).attr("y", y - 24).text(splited[0]);
          var tspan1 = text.append("tspan").attr("x", x).attr("y", y - 14).text(splited[1]);
      }
  })
}

textMap = (option) => {
  if (option == 'voto') {
      return "0.8rem"
  } else if (option == 'region') {
      return "0.8rem"
      //group[regiones[n.region]] = n
  } else if (option == 'partido') {
      return "0.8rem"
      //group[regiones[n.region]] = n
  } else if (option == 'provincia') {
      return "0.6rem"
  }
}

optionMap = (option, d) => {
  if (option == 'voto') {
      return codeVotes[d.voto]  + '(' + d.cantidad + ')'
  } else if (option == 'region') {
      return d.region + '(' + d.cantidad + ')'
      //group[regiones[n.region]] = n
  } else if (option == 'partido') {
      word = d.partido.split(" ")
      if (word[0] === "Movimiento") {
          word2 = d.partido.replace('Movimiento', 'M.')
          word2 = word2.replace(word[1], word[1].charAt(0) + '.')
          word2 = word2.replace(word[2], word[2].charAt(0) + '.')
          //console.log("new:" , word2)
          return word2
      }
      return d.partido + '(' + d.cantidad + ')'
      //group[regiones[n.region]] = n
  } else if (option == 'provincia') {
      word = d.provincia.split(" ")
      //console.log("p: " , word)
      if (word[0] === "santo") {
          word2 = d.provincia.replace('santo', 'S.')
          word2 = word2.replace(word[1], word[1].charAt(0) + '.')
          //console.log("new:" , word2)
          return word2
      }
      return d.provincia + '(' + d.cantidad + ')'
  }
}

updateGroupsofVis=(flag)=> {
    if(flag){
        d3.select("#nodosi").transition().style("display", "none").duration(100)
        d3.select("#plenosuperiorI").style("display", "block")
        d3.select("#curulI").style("display", "block")
    }
    else{
        d3.select("#nodosi").transition().style("display", "block").duration(100)
        d3.select("#plenosuperiorI").style("display", "none")
        d3.select("#curulI").style("display", "none")
    }
}

updatePlenoIndividual = (grafo) => {
    let curulesPorFila = [[2, 4], [3, 5], [4, 6], [5, 7], [6, 9], [8, 10]];

    var w2 = d3.select("#chart-area svg").style("width").split("px")[0]
    var h2 = d3.select("#chart-area svg").style("height").split("px")[0]
    LOGIND && console.log("W & H :", w2, h2)
    
    if(w2>799) w2 = 768.859
    console.log("Ori w2:", w2, 690 - w2)

    var xyfactor = w2 / 40.0;
    var acx = (690 - w2) / 8.4
    var cx = w2 / 2 + acx;// - 20;
    var cy = h2 / 4 - 20;
    var tcx = (800- w2)*0.28;
    var tcy = -(690- w2)/23.0;

    updatePos(w2,h2)
    LOGIND && console.log('factor', xyfactor)
    LOGIND && console.log("Acx:", acx, "cx:",cx, " cy:", cy, " tcx:", tcx, " tcy:", tcy)

    let nodos = grafo.nodosPrincipales(xyfactor, w2, true)

    sup.selectAll('circle').remove()
    sup.selectAll('circle')
        .data(nodos, d => d.id)
        .enter()
        .append('circle')
        .on("mouseover", tip.show).on("mouseout", tip.hide)
        .transition().duration(200)
        .attr("r", d=> d.r).attr('cx', d=> d.cx).attr('cy', d=>d.cy).attr('fill', d=> grafo.color(d, grafo.colorMap))

    let test = []
    test =  grafo.getNodosEdit(grafo.validNodes, curulesPorFila, cx, cy, tcx, tcy, xyfactor)
    LOGIND && console.log('Nodos Curul', test)

    let supl = []
    supl = test.filter(n=> n.suplente == true)

    LOGIND && console.log("suplentes:", supl)
    LOGIND && console.log("COLORMAP:", grafo.colorMap)

    inf.selectAll('circle').data(test, d=> d.curul)
        .join(
            enter => 
                enter.append('circle').on("mouseover", tip.show).on("mouseout", tip.hide)
                    .call(enter => enter.transition().attr("r", d=> d.r).attr('cx', d=> d.cx).attr('cy', d=> d.cy)
                        .attr('fill', d=> d.suplente ? "#fff" : grafo.color(d, grafo.colorMap))
                        .attr('class', d=> d.suplente ? "sup" : "normal")
                        .style('opacity', d=> d.opacidad)
                    ),
            update => update.transition().duration(200)
                    .attr("r", d=> d.r).attr('cx', d=> d.cx).attr('cy', d=> d.cy)
                    .attr('fill', d=> d.suplente ? "#fff" : grafo.color(d, grafo.colorMap) )
                    .attr('class', d=> d.suplente ? "sup" : "normal")
                    .style('opacity', d=> d.opacidad)
                    .style('opacity', d=> d.opacidad),
            exit => exit.remove().transition().duration(200)
        );
    
    //inf
    //    .on("mouseover", tip.show)
    //    .on("mouseout", tip.hide)

    suplentes.selectAll("polygon").data(supl, d=> d.curul)
        .join(
            enter => 
                enter.append('polygon').on("mouseover", tip.show).on("mouseout", tip.hide)
                .attr("width", d=> 10)
                .attr("height", d=> 10)
                .attr("points", d=> {
                    let points= ''
                    for (i = 0; i < 3; i++) {
                        points += [d.cx + (9 * Math.cos(2 * Math.PI * i / 3)),d.cy + (9* Math.sin(2 * Math.PI * i / 3))].join(",")
                        points += ' '
                    }
                    //console.log('POINTS:', points, d)
                    return points
                })
                .attr('fill', d=> grafo.color(d, grafo.colorMap))
                .style('opacity', d=> d.opacidad),
            update => 
                update.transition().duration(200)
                .attr("points", d=> {
                    let points= ''
                    for (i = 0; i < 3; i++) {
                        points += [d.cx + (9 * Math.cos(2 * Math.PI * i / 3)),d.cy + (9* Math.sin(2 * Math.PI * i / 3))].join(",")
                        points += ' '
                    }
                    return points
                })
                .attr('fill', d=> grafo.color(d, grafo.colorMap))
                .style('opacity', d=> d.opacidad),
            exit => exit.transition().duration(200).remove()
        )
}

updatePos = (w2, h2) =>{
    sup.attr("transform", "translate(" + (-w2/2)  + ", " + (-h2/3)  + ")")
    
    inf.attr("transform", "translate(" + (-w2/2)  + ", " + (-h2/3)  + ")")
}