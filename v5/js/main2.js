/*
 *    main.js
 *    Explorador de entidades, conjunto de funciones y variables globales a usar en los demas componenets
 */

var LOG = false

//Dimensiones del chart principal
var height = 700
var width = $('#chart').width()
var margin = {left: 80, right: 20, top: 70, bottom: 100};

/** Data  */
// Informacion de sesiones
let asambleistas = []
let sesiones = []

// info de data json's
let partidos = []
let regiones = []
let provincias = []
let comisiones = []

//Mapeo (Ids de cada partido, region, provincia)
let partidosId = []
let regionesId = []
let provId = []
let comisionesId = []

//grupos de asambleistas para los buscadores
let partidosG = []
let regionesG = []
let provG = []
let comG = [] //comisiones  

//dict de sesiones seleccionadas para la graficas
let idSesiones = {}
let lastIdS; 
let firstIds;


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

//OPciones del chart de rectangulos
let rectSize = 35
let rectSpaceSize = 40

let codeVotes = {
  "0" : "abstencion",
  "1" : "ausente",
  "2" : "si",
  "3" : "no",
  "4" : "blanco"
}

let voteCodes = {
  "abstencion": 0,
  "ausente": 1,
  "si": 2,
  "no": 3,
  "blanco": 4
}
let votesSet = [0, 1, 2, 3, 4]

let valueText = '';

//Manipular slider de votos
let listIndicesVotes = []
let dictIVotes = {}
let currentValueIndex=0;
let reverseDIVotes = {}
let totalDict;


let doNotAnimate = false

/*** Datos a cargar */
const promises = [
  d3.json("../../data/info.json"),
  d3.json("../../data/nodos.json"),
  d3.json("../../data/data.json"),
]

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

  createGroups()
  initChart()
  createTimelineEvents()

}

/** Eventos */
//buyscador de entidades
$("#searchEntity")
  .on("input", function () {
      valueText =  this.value
      findEntities(this.value)
  })
  .on("click", function () {
      valueText =  this.value
      findEntities(this.value)
  })

$("#searchArea")
  .on("mouseleave", function(){
    fueradelbuscadorEntidades()
  })


  //Buscar los votos  
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

$("#busquedaDiv")
  .on("mouseleave", function(){
    fueradelbuscadorVotos()
  })

  $("#buscarAsamb")
  .on("input", function () {
      let value =  this.value
      buscarAsambleistas(value, nodes)
  })
  .on("click", function () {
      buscarAsambleistas(this.value, nodes)
  })


$("#resultadosDiv")
  .on("mouseleave", function(){
    //console.log("afueraa")
    fueradelbuscadorEntidades()
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
            //d3.select('#reproductor').classed('fas fa-play')
            clearInterval(interval);
            setRangeTimeline()
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

        updateChart(currentSes, false)
    }
  });

$("#row-tamanio").ionRangeSlider({
  skin: "round",
  min: 20,
  max: 40,
  from: 35,
  step: 1,
  grid: true,
  hide_min_max: true,
  onChange: function (data) {
      let numero = data.from
      rectSize = numero
      rectSpaceSize = rectSize + 5
      //console.log("nuevas medidas:", rectSize, rectSpaceSize)
      updateChart(currentSes, true)
      //d3.timeout(chart, 500)
  }
});

$("#slider-votos").ionRangeSlider({
  skin: "round",
  min : 0,
  max: 0, 
  from: 0, 
  step:1, 
  hide_min_max: true, 
  //grid: true,
  //grid_snap: true  
});
//Fin de eventos

/**Funciones secundarias */

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

_groups = () => {
  const groups = {
    "si": { x: 1.5*width/6, y: height/6, cnt: 0, fullname: "Si" },
    "no": { x: 3*width/4, y: height/6, cnt: 0, fullname: "No" },
    "ausente": { x: width/5, y: 2*height/2.5, cnt: 0, fullname: "Ausente" },
    "abstencion": { x: 3.5*width/4, y: 2*height/2.5, cnt: 0, fullname: "Abstención" },
    "blanco": { x: width/2 +29, y: 2*height/2.5, cnt: 0, fullname: "Blanco" },
  };
  return groups
}

getIdSes = (id) =>{
  LOG && console.log("Anadir sesion ", id)
  //resetFlags()
  addSesion(id)
}

function addSesion(id){
  if (id in idSesiones) {
    LOG && console.log("Esta en uso")   
    return;
  }else {
    idSesiones[id] = sesiones[id]
    //addCircle(id)
    listIndicesVotes.push(id)
    totalDict = listIndicesVotes.length -1 
    updateSlider()
  }
  
  LOG && console.log("Sesiones anadidas:", idSesiones)
  currentSes = id

  //let sesionesID = d3.keys(idSesiones)
  //let index = sesionesID.indexOf(currentSes)
  //console.log("index:", index, "id:", currentSes)
  //currentId = index

  currentId = reverseDIVotes[id]
  //console.log("ReverseDICT:", reverseDIVotes, "currentID:", currentId)
  
  let valuesDICT = Object.keys(idSesiones)
  LOG && console.log("KEYS:", valuesDICT)
  lastIdS = valuesDICT[valuesDICT.length-1]
  firstIds = valuesDICT[0]
  LOG && console.log("LastVALUE:", lastIdS, "FIRST:", firstIds)
  //addSesionToList(id)
  updateChart(id, false)
}

function removeSes(id) {
  let tmpid = 'sesion' + id
  LOG && console.log("Function onclick", tmpid)
  idSesiones[id].estado = 0

  LOG && console.log(idSesiones)
  delete idSesiones[id]
}

/// Resetea los valores de visitado de los nodos
function resetFlags() {
  for (let key in entidades) {
      if (entidades[key].visitado == true)
        entidades[key].visitado = false
  }
}


color = (d, option) => {
  //console.log("option", option)
  //console.log("D:", d)
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
      //console.log("value:", valueId)
      //console.log("code:", voteCodes[valueId])
      return colorVotos(voteCodes[valueId])
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
  const colors = ["#1b70fc", "#158940", "#d50527", "#faff16", "#f898fd", "#24c9d7", "#cb9b64", "#866888", "#22e67a", "#e509ae", "#9dabfa", "#437e8a"
                  ,"#388e51", "#da3e2e", '#00aae4', "#ff7333", "#f986db", "#5151ff", "#ffc04d", "#de363d"]
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

function udpateSliderVotes(){
  let slider = $("#slider-votos").data("ionRangeSlider");

  LOG && console.log("size:", listIndicesVotes.length-1, "from:", currentValueIndex)
  let max = listIndicesVotes.length
  
  LOG && console.log("INDICES:", listIndicesVotes)
  LOG && console.log("SIZE:", totalDict)

  slider.update({
    min: 0,
    max: max-1,
    from: 0,
    step: 1, 
    grid: true,
    //grid_num: totalDict, 
    //hide_min_max: true,
    onChange: function (data) {
      let numero = data.from
      currentValueIndex = numero
      //console.log("numero:", currentValueIndex)
      let sesId = dictIVotes[currentValueIndex]
      //console.log("SESION:", sesId)
      updateChart(sesId, false)
    },
    onFinish: function (data) { 
      let numero = data.from
      currentValueIndex = numero
      //console.log("numero:", currentValueIndex)
      let sesId = dictIVotes[currentValueIndex]
      //console.log("SESION:", sesId)
      findsesion(sesId)
    },
    //prettify_enabled: true,
    //prettify_separator: ',',
    prettify: function (n) {
      let sesId = dictIVotes[n]
      var tag = sesiones[sesId]
      //console.log('tag:',tag)
      return "Sesión " + tag.sesion + " Votación " + tag.votacion
    },  
  });

  LOG && console.log("SLider:", slider)
}

function updateValuesForSlider(){

  LOG && console.log("current List:", listIndicesVotes)
  listIndicesVotes.sort( (a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0))
  LOG && console.log("sorted List:", listIndicesVotes)

  dictIVotes = {}
  reverseDIVotes ={}
  for (var i = 0; i < listIndicesVotes.length; i++) {
    dictIVotes[i] = listIndicesVotes[i]
    reverseDIVotes[listIndicesVotes[i]] = i
    LOG && console.log(i, dictIVotes[i])
  }

  LOG && console.log("Dict resultante:", dictIVotes, reverseDIVotes)
}


function updateSlider(){
  updateValuesForSlider()
  udpateSliderVotes()
}

step = () =>{ 
  
  LOG && console.log("currentID:", currentId)

  if(currentId == lastIdS){
    LOG && console.log("limite")
    currentId = parseInt(firstIds)
  }
  else if(currentId < lastIdS) {
    currentId = parseInt(currentId)+1
    LOG && console.log(currentId)
  }

  currentSes = dictIVotes[currentId]
  updateChart(currentSes, false)

  let slider = $("#slider-votos").data("ionRangeSlider");
  slider.update({
    from: currentId
  })
  findsesion(currentSes)
}

nextSes = () => {
  LOG && console.log("currentID:", currentId)

  if(currentId == lastIdS){
    LOG && console.log("limite")
    currentId = parseInt(firstIds)
  }
  else if(currentId < lastIdS) {
    currentId = parseInt(currentId)+1
    LOG && console.log(currentId)
  }

  currentSes = dictIVotes[currentId]
  updateChart(currentSes, false)

  let slider = $("#slider-votos").data("ionRangeSlider");
  slider.update({
    from: currentId
  })
  findsesion(currentSes)
}

prevSes = () => {

  LOG && console.log("currentID:", currentId)

  if(currentId == firstIds){
    LOG && console.log("limite primero")
    currentId = parseInt(lastIdS)
  }
  else if(currentId > firstIds) {
    currentId = parseInt(currentId) - 1
    LOG && console.log(currentId)
  }

  currentSes = dictIVotes[currentId]
  updateChart(currentSes, false)

  let slider = $("#slider-votos").data("ionRangeSlider");
  slider.update({
    from: currentId
  })

  findsesion(currentSes)

}