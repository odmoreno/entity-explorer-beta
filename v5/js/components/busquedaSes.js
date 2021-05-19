/**
 * Busqueda de sesiones
 */

var LOGBS = true

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
    matches = matches.slice(0, 13)

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
                onmouseover="overEntidades()" onmouseleave="onLeaveEntidades()"> 
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

              <div class="d-flex flex-column">
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

/**FUNCIONES de drag con los resultados y drop con el grafico */
function drag2(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function allowDrop2(ev) {
  ev.preventDefault();
}

function drop2(ev) {
  ev.preventDefault();
  console.log("Hola, ingreso de entidad en el timeline")
  var data = ev.dataTransfer.getData("text")
  //var id = document.getElementById(data)
  //console.log(id)
  console.log(data)

  let idnew = data.substring(1)

  let item = sesiones[idnew]

}


function handleDragStart(event) {
  var dragSrcEl = event.target;

  console.log("drag:", dragSrcEl)
  console.log(dragSrcEl.id)

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
  console.log("ID END:", element.id)
  
  let item = sesiones[idnew]
  console.log("item:", item)
  let fecha = item.fecha.split('-')
  let hora = item.hora.split(':')
  console.log(fecha)


  let node = {
    'id': item.sesId,
    'className': item.anio == '2017' ? 'orange' : (item.anio == '2018' ? 'green' : (item.anio == '2019' ? 'red' : (item.anio == '2020' ? 'magenta' : 'default') ) ),
    'group': item.anio,
    'content': getContent2(item),
    'asunto': item.asunto,
    'title': item.name,
    "type": "box",
    'start': new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]), parseInt(hora[1]) ),
    'end' : new Date( parseInt(fecha[0]), parseInt(fecha[1]), parseInt(fecha[2]), 23, 59 ),
  }

  datas.add(node)
  
  getIdSes(item.sesId)

  var options = {};
  var newOpt = {
    min: new Date(2017, 4, 1), // lower limit of visible range
    max:  new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2] +1), 23, 59 ),
  }
  Object.assign(options, defaultOptions, newOpt);
  timeline.setOptions(options);

  //var dir = -2
  //var range = timeline.getWindow();
  //var interval = range.end - range.start;
  //timeline.setWindow({
  //  start: range.start.valueOf() - interval * dir * 0.2,
  //  end: range.end.valueOf() + interval * dir * 0.2,
  //});

  timeline.fit()
}


function handleDragStart2(event) {
  var dragSrcEl = event.target;
  console.log("Drag23")

}

function handleDragEnd2(e) {
  let element = e.target; // This is the same element as we used before
  let id = element.id
  let idnew = id.substring(1)
  console.log("ID END:", element.id)
  
  let item = sesiones[idnew]
  console.log("item:", item.sesion)


  let sesionesList = Object.values(sesiones) 
  console.log(sesionesList)
  let newList = [... sesionesList]
  let sVotes = newList.filter(v => v.sesion == item.sesion)
  console.log('SES:', sVotes)

  sVotes.map(item => {
    console.log("item:", item)
    let fecha = item.fecha.split('-')
    let hora = item.hora.split(':')
    console.log(fecha)
    let node = {
      'id': item.sesId,
      'className': item.anio == '2017' ? 'orange' : (item.anio == '2018' ? 'green' : (item.anio == '2019' ? 'red' : (item.anio == '2020' ? 'magenta' : 'default') ) ),
      'group': item.anio,
      'content': getContent2(item),
      'asunto': item.asunto,
      'title': item.name,
      "type": "box",
      'start': new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]), parseInt(hora[1]) ),
      'end' : new Date( parseInt(fecha[0]), parseInt(fecha[1]), parseInt(fecha[2]), 23, 59 ),
    }

    datas.add(node)
    getIdSes(item.sesId)

    var options = {};
    var newOpt = {
      min: new Date(2017, 4, 14), // lower limit of visible range
      max:  new Date( parseInt(fecha[0]), parseInt(fecha[1] -1), parseInt(fecha[2]), 23, 59 ),
    }
    Object.assign(options, defaultOptions, newOpt);
    timeline.setOptions(options);

  })

  timeline.fit()
}

function addListeners(){
  var items = document.querySelectorAll(".itemVotes");
  console.log("items", items)

  for (var i = items.length - 1; i >= 0; i--) {
    var item = items[i];
    item.addEventListener("dragstart", handleDragStart.bind(this), false);
    item.addEventListener('dragend', handleDragEnd.bind(this), false); 
  }
  
  if(sesFlag){
    var itemsSes = document.querySelectorAll(".itemSes");

    console.log("items", itemsSes)

    for (var i = itemsSes.length - 1; i >= 0; i--) {
      var item2 = itemsSes[i];
      console.log("D:", item)
      item2.addEventListener("dragstart", handleDragStart2.bind(this), false);
      item2.addEventListener('dragend', handleDragEnd2.bind(this), false); 
    }
  }
}



