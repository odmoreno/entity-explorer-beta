/** 
 * Funciones para el crear el timeline horizontal
 * 
 */

var LOGT = true

var firstSesid = 0
var lastSesid = 10;
var listKeys;
var local = []

var lastIDGraph;

let csesId;
let modo;


// ADD Circles (sesiones) al timeline
function addCircle(id){

  var sesion = sesiones[id]
  LOGT && console.log("Sesion: ", sesion, lastSesid)

  //Integer representation 
  var thisInt = sesion.sesId 

  //Actualiza
  updateValues(thisInt)
  
  local.sort( (a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0) )
  LOGT && console.log(local)  

  var escalax = escala()
  LOGT && console.log("Escalado 1: ", escalax(thisInt), "lastSesid:", lastSesid, "This:", thisInt)
  
  thisInt = escalax(thisInt)
  //Integer relative to the first and last dates
  var relativeInt = thisInt / lastSesid;
  if(relativeInt == 1 ) relativeInt = 0.99
  if(local.length == 1) relativeInt = 0
  LOGT && console.log("Relative INT: ", relativeInt)

  //addTransitionOfSessions(id, relativeInt) aa

  $(".active").removeClass("active");

  d3.selectAll(".active").transition()
    .style('opacity', '.5')
    .duration(300)
    .remove()

  //Dibujamos el cuadrado de la sesion con una opacidad de 0.05 para que no se note 
  let circle = d3.select("#line").append("div")
    .attr('class', 'cuadradoL')
    .attr('id', 'c' + id)
    //.style("left", "0%")
    .style('opacity', '.5')
    .style("left", relativeInt * 100 + "%")
    .classed('active', true)
    
  //transition de opacidad a 0.9 para que se coordine con la animacion de movimiento
  d3.select("#c"+id).transition()
    .delay(900)
    .duration(700)
    .style('opacity', '.9')
    //.style("left", relativeInt * 100 + "%")
    
    

  let circleEdit = circle
  circleEdit.append('div')
    .attr('class', 'popupSpan')
    .text('Sesión ' + sesion.sesion + ' Votación ' +  sesion.votacion)

  circleEdit.on('mouseenter', function(d, i) {
    
    d3.select(this).classed('hover', true);
    //onHoverGraph(id)
  })

  circleEdit.on('mouseleave', function(d, i) {
    d3.select(this).classed('hover', false);
    //onDesHoverGraph(id)
  })

  circleEdit.on("click", clickAction)
  
}

function addTransitionOfSessions(id, value){

  var offset = $( "#b"+ id ).offset();
  LOG && console.log("offset:", offset, " coords ( " + offset.left + ", " + offset.top + " )" )

  var lineOffset =  $( "#line" ).offset();
  LOG && console.log("offset Line:", lineOffset)
  //LOG && console.log( $( "#line" ))
  //console.log( "LINEA: ", d3.select("#line").style('width') )
  var widthLinea = d3.select("#line").style('width')
  widthLinea = widthLinea.split("px")
  LOGT && console.log(widthLinea[0], " %: ", value)
  var valueextra = widthLinea[0] * value
  LOGT && console.log("extra:", valueextra)

  var totalL = lineOffset.left + valueextra
  LOGT && console.log(totalL) 


  let box = d3.select("#content").append("div")
      .attr('class', 'box box2')
      .attr('id', 'ccb' + id)
      .style('top',(offset.top - 10) +"px" )
      .style('left',offset.left +"px" )

  d3.timeout(()=> {

      box.attr('class', 'box box1')
          .classed('before', true)
          .style('top', (lineOffset.top - 7) +"px" )
          .style('left', totalL + "px" )
          //.style('left', lineOffset.left +"px" )

      box.transition()
          .attr('opacity', '.50')
          .duration(1000)
          .remove()

  }, 100)

}

function clickAction(){
  
  $(".active").removeClass("active");

  let circle = d3.select(this)
  circle.classed('active', true)
  
  let sId = d3.select(this).attr("id").substring(1)
  LOGT && console.log("SesiD clicked: ", sId)

  highlightGraph(sId)

  if (currentSesId != sId) {
    saveSes(currentSesId)
    changeGraph(sId)
  }
}

function removeCircle (id) {
  
  var index = local.indexOf(id)
  local.splice(index, 1);

  let max = compareV(local[0])
  lastSesid = max
  updateRange()

  d3.select("#c" + id)
            .transition()
            
            .attr('opacity', '.50')
            .ease(d3.easeCircleInOut) 
            .delay(200)
            .duration(500)
            .remove()

}

function updateValues(currentId){
  LOGT && console.log("Fun updateValues")
  if (local.length < 1 ){
    local.push(currentId)
    let max = compareV(currentId)
    LOGT && console.log("Max:", max, "last:", lastSesid)
    if (max > lastSesid) {
      lastSesid = max
    }
    //firstSesid = local[0]
  }
  else if (local.length >= 1){
    LOGT && console.log( "Update Values! ", local.length)
    local.sort( (a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0) )
    
    firstSesid = local[0]

    let max = compareV(currentId)
    //console.log("Local ids:", local ,"TmpLast:", max)
    lastSesid = max

    updateRange()

    local.push(currentId)
    LOGT && console.log( "Local: " ,local)
  }
}


compareV = (sesId) => {

  let max = Number(sesId);
  csesId = Number(sesId);
  modo = 1 //significa que el max no se encuentra en el array local
  LOGT && console.log("Local ids:", local ,"TmpLast:", max)

  local.forEach(function (i) {
    LOGT && console.log("HI:", i)
    i = Number(i)
    if ( i > max){
      LOGT && console.log("MAYOR:", i)
      max = i
      modo = 2 //significa que el max se encuentra en el array local
    }
  })
  LOGT && console.log("MAXX:", max, " Modo:", modo)

  return max
}

updateRange = () => {
  
  local.forEach(function (i) {
    LOGT && console.log(i)

    //var value  = escala(lastSesid) 

    //var newi = (lastSesid-i) > 200 ? i*5 : ( (lastSesid-i) > 100 ? i*1.5 : ( (lastSesid-i) > 75 ? i*1.5 : i) )
    //console.log("New i:", newi)

    var escalax = escala()
    LOGT && console.log("Escalado 2: ", escalax(i), "lastSesid:", lastSesid)
    
    var relativeInt = escalax(i) / lastSesid;


    if(relativeInt == 1) relativeInt = 0.99
    LOGT && console.log("rela:", relativeInt)
    d3.select("#c"+i).transition().ease(d3.easeCircleInOut).style("left", relativeInt * 100 + "%").duration(800)
  })

}

escala = () => {
  LOGT && console.log("LAST:", lastSesid)
  if( csesId < local[0] ) firstSesid = csesId
  var myScale = d3.scaleLinear()
      .domain([firstSesid, lastSesid ])
      .range([ 0, lastSesid]);
      
      LOGT && console.log(local)
  return myScale
}

function changeGraph(sId){
  if(graphflag){
    clearSelection()
    disabledOptions()
    LOGT && console.log("inside graph")
    removeAllFilters()
    
    currentSesId = sId
    graphflag = true
    graphEdit = false

    //fechaList.innerHTML = ''
    showOptions()

    let data = graphSet[currentSesId]
    LOGT && console.log("Currente GRAPH: ", data)
    LOGT && console.log("Data grpa: ", data.filtersDiv)
    
    
    //$("#sesion2")[0].innerHTML = data.sesion.sesion
    //$("#votacion2")[0].innerHTML = data.sesion.votacion
    $("#asunto")[0].innerHTML = data.sesion.asunto
    $("#fecha")[0].innerHTML = data.sesion.fecha
    $("#hora")[0].innerHTML = data.sesion.hora
    showVotacionesBar(data.sesion)

    applyFilters(data)
    //enabledFilter()
    $('option[value=' + data.groupMap + ']', $('#grupos-select')).prop('selected', true);
    $('option[value=' + data.colorMap + ']', $('#colores-select')).prop('selected', true);
    $('#grupos-select').multiselect('refresh');
    $('#colores-select').multiselect('refresh');


    updateGraph(data, false)
    lastIDGraph = sId
  }
}

function saveSes(indice){
  LOGT && console.log("Save sesion: ", indice)
  let data = graphSet[indice]
  
  if (graphflag){
    updateVis(data, data.colorMap, data.groupMap)
    saveFilters(data)
  } 

}



