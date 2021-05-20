/**
 * Busqueda de sesiones
 */

var LOGBS = false

let listaResultadosV = document.getElementById('busquedaDiv');


fueradelbuscadorVotos =() => {
  listaResultadosV.innerHTML = ''
}

function searchSesiones(searchText) {
    
  listaResultadosV.innerHTML = ''

  let word = validateInput(searchText)
  LOGBS && console.log("search: ", word)
  let ses = Object.values(sesiones)
  
  let matches = filterData(word, ses)
 
  if (searchText.length === 0) {
      matches = []
      listaResultadosV.innerHTML = ''
  }
  if (matches.length > 13)
    matches = matches.slice(0, 15)

    LOGBS && console.log("data:", matches)
    outputSesiones(word)
    outputVotes(matches)
    addListeners()
}

//valida si ingreso algun numero que pueda ser una sesion
function validateInput (text) {
    let value = text
    let searchSes = text.split(" ")
    numberFlag = false
    //asuntoFlag = true
    searchSes.forEach(function (word) {
        let num1 = parseInt(word)
        LOGBS && console.log(num1)
        if(!isNaN(num1)){
            LOGBS && console.log("Es un numero: ", num1)
            value = word
            numberFlag = true
            //asuntoFlag = false
        }
    })
    return value
  } 
  
  
function filterData (text, ses) {
  sesFlag = false
  let matches1 = []
  let matches2 = ses.filter(sess => {
      const regex2 = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
      //console.log(regex2)
      //sess.asunto.match(regex2) .replace(regex2, '<b>'+text+'</b>')
      
      return sess.asunto.match(regex2)
  });
  if(numberFlag == true){
      //filtrar por sesion
      matches1 = ses.filter(sess => {
          const regex = new RegExp(`^${text}`, 'gi')
          //console.log(regex)
          let sesionN = sess.sesion.toString();
          if(sesionN === text) sesFlag = true
          return sesionN.match(regex) 
      });
  }
  LOGBS && console.log("Sesiones:", matches1)
  LOGBS && console.log("Asuntos:", matches2)
  if(matches1.length > 0) {
      //sesFlag = true
      matches1.sort((a,b) => (a.votacion > b.votacion) ? 1 : ((b.votacion > a.votacion) ? -1 : 0))
      return matches1
  }
  else{
      LOGBS && console.log(matches2)
      let words = matches2.map(match => {
          var newtext = match.asunto.replace(text, '<b>'+text+'</b>')
          //console.log(newtext)
          match.bold = newtext
          return match
      })
      LOGBS && console.log(words)
      return words
  }
  
}



/**Lista de sesiones */
function outputSesiones (option) {
  /**<div  class=" card py-2 </div> "> */
 if(sesFlag){
  const header = 
  `<div class="card-listU">
    <a href="#collapse${option}" class="d-block card-headerU py-2" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="collapseCardExample">
      <h6 class="m-0 font-weight-bold text-primary" style="text-transform:capitalize">Sesión</h6>
    </a>
    <div class="collapse show" id="collapse${option}">
      <div id="body-${option}" class="card-body">
      </div>
    </div>
  </div>`

  listaResultadosV.innerHTML += header

  let element = sesiones[option]
  //console.log(option, element)
  const html = 
      `<div id="x${element.sesId}" class="card-listU itemSes py-1 ${!element.flag ? 'draggme' : 'nodrag'}" 
      draggable="${!element.flag ? true : false}"  >
      <div class="d-flex flex-row ml-3 justify-content-between">

        <div  class=" d-flex flex-row l mb-1" style="align-items: center;">
          <span class="${element.flag ? 'entitySelected': 'entityAway'}"  
                onmouseover="overSesiones(${element.sesId})" onmouseleave="onLeaveSesiones(${element.sesId})"> 
                 Sesión ${option} </span>
        </div>
      </div>
    </div>`//.join('');

    let entidadesListCard = document.getElementById('body-'+option);
    //console.log(entidadesListCard)
    //entityList.innerHTML += html
    entidadesListCard.innerHTML += html
  }
}


/**
 * <svg height="15" width="15" class="mr-3"><circle cx="12" cy="6" r="5"  fill="blue" /></svg>
  ondragstart="drag2(event)" 
*/
function outputVotes(matches){

  if (matches.length > 0) {

    const header = 
      `<div class="card-listU">
        <a href="#collapseAsambs2" class="d-block card-headerU py-2" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="collapseCardExample">
          <h6 class="m-0 font-weight-bold text-primary" style="text-transform:capitalize">Votos</h6>
        </a>
        <div class="collapse show" id="collapseAsambs2">
          <div id="bodyAsambs3" class="card-body">
          </div>
        </div>
      </div>`

    console.log("Matches votes:", matches)
    listaResultadosV.innerHTML += header
    const html = matches.map(element =>
      `<div  id="v${element.sesId}"  class="card-listU itemVotes py-1 ${!element.visitado ? 'draggme' : 'nodrag2 noselect'}"
          draggable="${!element.visitado ? true : false}"  
          style="border-bottom: 1px solid powderblue;">

          <div class="d-flex flex-row ml-3 justify-content-between">
            <div  class=" d-flex flex-row l mb-1" style="align-items: center;">

              <div class="d-flex flex-column" onmouseover="overVotes(${element.sesId})" onmouseleave="onLeaveVote(${element.sesId})">
                <div class="d-flex flex-row">
                  ${ sesFlag ? ' ': `<span class='mr-2'  style="color: #034EA2; font-weight: bold;"> Sesión ${element.sesion}</span>`}
                  <span class='mr-2' style="color: #034EA2; font-weight: bold;"> Votación ${element.votacion}</span>
                </div>
                <span style="color: #54575b;"> (${element.fecha} ${element.hora}): </span>
                <span> ${ element.bold ? element.bold : element.asunto } ... </span> 
              </div>

            </div>
          </div>
      </div>`
    ).join('');
    
    let entidadesListCard = document.getElementById('bodyAsambs3');
    entidadesListCard.innerHTML += html

    //listaResultadosV.innerHTML = html
  }
}


function overVotes(id){
  d3.select("#v"+id).style("border", "2px solid orange")
}

function onLeaveVote(id){
  d3.select("#v"+id).style("border", "2px solid white")
}

function overSesiones(id){
  d3.select("#x"+id).style("border", "2px solid orange")
}

function onLeaveSesiones(id){
  d3.select("#x"+id).style("border", "2px solid white")
}

/**FUNCIONES de drag con los resultados y drop con el grafico */
function drag2(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function allowDrop2(ev) {
  ev.preventDefault();
}

function drop2(ev) {
  ev.preventDefault();
  LOGBS && console.log("Hola, ingreso de entidad en el timeline")
  var data = ev.dataTransfer.getData("text")
  //var id = document.getElementById(data)
  //console.log(id)
  LOGBS && console.log(data)

  let idnew = data.substring(1)

  let item = sesiones[idnew]

}


function handleDragStart(event) {
  var dragSrcEl = event.target;

  LOGBS && console.log("drag:", dragSrcEl)
  LOGBS && console.log(dragSrcEl.id)

  let idnew = dragSrcEl.id.substring(1)

  let item = sesiones[idnew]
  let fecha = item.fecha.split('-')
  let hora = item.hora.split(':')

  //let node = {
  //  'id': item.sesId,
  //  'className': item.anio == '2017' ? 'orange' : (item.anio == '2018' ? 'green' : (item.anio == '2019' ? 'red' : (item.anio == '2020' ? 'magenta' : 'default') ) ),
  //  'group': item.anio,
  //  'content': getContent(item),
  //  'asunto': item.asunto,
  //  'title': item.name,
  //  "type": "box",
  //  'start': new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]), parseInt(hora[1]) ),
  //  'end' : new Date( parseInt(fecha[0]), parseInt(fecha[1]), parseInt(fecha[2]), 23, 59 ),
  //}
//
  //console.log(node)
  //datas.add(node)
  //timeline.fit()

  //event.dataTransfer.setData("text", JSON.stringify(node));

}

function handleDragEnd(e) {
  let element = e.target; // This is the same element as we used before
  let id = element.id
  let idnew = id.substring(1)
  LOGBS && console.log("ID END:", element.id)
  
  let item = sesiones[idnew]
  LOGBS && console.log("item:", item)
  let fecha = item.fecha.split('-')
  let hora = item.hora.split(':')
  LOGBS && console.log(fecha)

  console.log("fecha:", fecha, "hora:", hora)


  let node = {
    'id': item.sesId,
    'className': item.anio == '2017' ? 'orange' : (item.anio == '2018' ? 'green' : (item.anio == '2019' ? 'red' : (item.anio == '2020' ? 'magenta' : 'default') ) ),
    'group': item.anio,
    'content': getContent2(item),
    'asunto': item.asunto,
    'title': item.name,
    "type": "box",
    'start': new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]), parseInt(hora[1]) ),
    'end' : new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), 23, 59 ),
  }

  datas.add(node)
  
  getIdSes(item.sesId)
  
  setRangeTimeline()

  //var dir = -2
  //var range = timeline.getWindow();
  //var interval = range.end - range.start;
  //timeline.setWindow({
  //  start: range.start.valueOf() - interval * dir * 0.2,
  //  end: range.end.valueOf() + interval * dir * 0.2,
  //});

  //timeline.fit()
}


function handleDragStart2(event) {
  var dragSrcEl = event.target;
  LOGBS && console.log("Drag23")

}

function handleDragEnd2(e) {
  let element = e.target; // This is the same element as we used before
  let id = element.id
  let idnew = id.substring(1)
  LOGBS && console.log("ID END:", element.id)
  
  let item = sesiones[idnew]
  LOGBS && console.log("item:", item.sesion)


  let sesionesList = Object.values(sesiones) 
  LOGBS && console.log(sesionesList)
  let newList = [... sesionesList]
  let sVotes = newList.filter(v => v.sesion == item.sesion)
  LOGBS && console.log('SES:', sVotes)

  sVotes.map(item => {
    LOGBS && console.log("item:", item)
    let fecha = item.fecha.split('-')
    let hora = item.hora.split(':')
    LOGBS && console.log(fecha)
    let node = {
      'id': item.sesId,
      'className': item.anio == '2017' ? 'orange' : (item.anio == '2018' ? 'green' : (item.anio == '2019' ? 'red' : (item.anio == '2020' ? 'magenta' : 'default') ) ),
      'group': item.anio,
      'content': getContent2(item),
      'asunto': item.asunto,
      'title': item.name,
      "type": "box",
      'start': new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]), parseInt(hora[1]) ),
      'end' : new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), 23, 59 ),
    }

    datas.add(node)
    getIdSes(item.sesId)

    setRangeTimeline()
    //Object.assign(options, defaultOptions, newOpt);
    //timeline.setOptions(options);

  })

  //timeline.fit()
}

function addListeners(){
  var items = document.querySelectorAll(".itemVotes");
  LOGBS && console.log("items", items)

  for (var i = items.length - 1; i >= 0; i--) {
    var item = items[i];
    item.addEventListener("dragstart", handleDragStart.bind(this), false);
    item.addEventListener('dragend', handleDragEnd.bind(this), false); 
  }
  
  if(sesFlag){
    var itemsSes = document.querySelectorAll(".itemSes");

    LOGBS && console.log("items", itemsSes)

    for (var i = itemsSes.length - 1; i >= 0; i--) {
      var item2 = itemsSes[i];
      LOGBS && console.log("D:", item)
      item2.addEventListener("dragstart", handleDragStart2.bind(this), false);
      item2.addEventListener('dragend', handleDragEnd2.bind(this), false); 
    }
  }
}


function setRangeTimeline(){
  let range = timeline.getItemRange()
  console.log("RANGE:", range)

  let minTl = range.min
  let maxTl = range.max
  console.log(minTl, maxTl)

  let lastSesionList = sesiones[lastIdS]
  console.log("LastSes:", lastSesionList)
  let fecha = lastSesionList.fecha.split('-')
  let hora = lastSesionList.hora.split(':')
  let newMax = new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]) +1,  59 )

  //console.log("NEWMAX:", newMax,  parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]) +1,  59)
  timeline.setWindow(minTl, newMax, { animation: true });

  //var options = {};
  //var newOpt = {
  //  min: minTl,
  //  max:  new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]+2, 59), 59 ),
  //}
  //Object.assign(options, defaultOptions, newOpt);
  //timeline.setOptions(options);
}

function findsesion(id){

  let lastSesionList = sesiones[id]
  console.log("LastSes:", lastSesionList)
  let fecha = lastSesionList.fecha.split('-')
  let hora = lastSesionList.hora.split(':')
  let newMax = new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]) +1,  59 )
  let newMin = new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]) -4,  59 )

  //console.log("NEWMAX:", newMax,  parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]) +1,  59)
  timeline.setWindow(newMin, newMax, { animation: true });

  timeline.setSelection(id, { focus: false });
  //timeline.focus(id);
}