/** 
 * Funciones secundarias o extras para el entidades.js
 * 
 */

var LOGO = true

let sesionList = {}

let sesionElementList = document.getElementById('sesiones-list');

/** Conjunto de funciones encargadas de manejar la lista de sesiones */
function addSesionToList (id){
  sesionList[id] = sesiones[id]
  updateSesionList()
}

function updateSesionList() { 

  let list = Object.values(sesionList)
  list.sort((a, b) => (a.sesId > b.sesId) ? 1 : ((b.sesId > a.sesId) ? -1 : 0))
  LOGO && console.log("sorted:", list)
  sesionElementList.innerHTML = '' 
  if (list.length > 0){
    const html = list.map(data => 
        `<div class="d-flex flex-row" style="align-items: center;">
          <div class="mr-2"> 
            <a href=${'#card' + data.sesId} class="d-block card-subtitle py-3" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="collapseCard"
              data-toggle="tooltip" data-placement="top" title="${data.asunto}" style="text-align: center;">
              <div class="d-flex flex-row">
                <div class="d-flex flex-column">
                  <span class="m-1 text-secondary">Sesion ${data.sesion} Votacion ${data.votacion}</span>
                  <small class="m-1 text-primary"> ${data.fecha} (${data.hora})</small>
                </div>
                <button type="button" id="btn-remove ${data.sesId}" class="btn btn-special btn-success btn-circle btn-sm ml-4" onclick="removeSeslist(this.id)"><i class="fas fa-minus"></i></button>
              </div>
            </a>
            <div class="collapse" id=${'card' + data.sesId} >
                <div class="card-body">
                  <span style="text-transform:capitalize;">${data.asunto}</span>
                  
                </div>
            </div>
          </div>
          
        </div>`
    ).join('');
    //console.log(html)
    sesionElementList.innerHTML += html
  }
}

removeSeslist = (id2) => {
  LOGO && console.log("remove ses ", id2)
  let splitid = id2.split(" ")
  let id = splitid[1]
  LOGO && console.log(splitid)

  delete sesionList[id]
  updateSesionList()

  removeCircle(id)

  console.log(idSesiones)

  delete idSesiones[id]
}

/**Fin de lista de sesiones */


/**Conjunto de funciones para manejar la lista de asambleistas filtrados
 * 
 * <input class="mr-2" type="checkbox" id=${'A'+element.numeroId } onclick="onGetIdList(this.id)"  ${element.visitado ? 'checked' : ''} ></input>
 */

//let entityList = {}

let entityList = document.getElementById('entity-list');

function initializeList (nodos) {
  let list = Object.values(nodos)
  console.log("LIST:", list)
  list.sort(value => { return value.visitado ? -1 : 1})
  //entityList.innerHTML = ''
  const html = list.map(element => 
    `<div  id="e${element.numeroId}"  class="d-flex flex-column ml-4" 
        draggable="${!element.visitado ? true : false}" ondragstart="drag(event)" 
          onmouseover="overEntity(${element.numeroId})" onmouseleave="onLeaveEntity(${element.numeroId})">
        
        <div  class=" d-flex flex-row l mb-1" style="align-items: center;">

          <svg height="12" width="12" class="mr-3"><circle cx="5" cy="5" r="5"  fill="${color(element, colorMap)}" /></svg>

          <span  class="${element.visitado ? 'entitySelected': 'entityAway'}"  > ${element.nombre} </span>
        </div>
    </div>`
  ).join('');

  //console.log("html:", html)
  entityList.innerHTML += html
}


function overEntity(id){
  //console.log("ID ENTITY:", id)
  let element = nodosActuales[id]
  //console.log(element)
  if(element.visitado){
    d3.select("#node"+id).attr("stroke", "orange").attr("stroke-width", 3.0)
    d3.select('#text' + id).attr("visibility", "visible")
    //tip3.show(element)
  }
    
    
}

function onLeaveEntity(id){
  let element = nodosActuales[id]
  d3.select("#node"+id).attr("stroke", "#fff").attr("stroke-width", 0)
  d3.select('#text' + id).attr("visibility", "hidden")
  //if(element.visitado)
    //tip3.hide()
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {
  ev.preventDefault();
  console.log("Hola, ingreso de entidad en el svg")
  var data = ev.dataTransfer.getData("text")
  var id = document.getElementById(data)
  var x = ev.offsetX
  var y = ev.offsetY
  console.log(ev)
  console.log(data, x, y)
  //console.log(d3.select(ev.target).attr('id'))
  console.log(id)
  onGetIdList(data, x, y)
 // var data = ev.dataTransfer.getData("text");
 // ev.target.appendChild(document.getElementById(data));
}

function findEntities (searchText) {
  entityList.innerHTML = ''
  if(searchText === "") initializeList(nodosActuales)
  
  let text = searchText.toLowerCase()
  if(text == 'partidos')
      filterPartidos(searchText, true)     
  else if (text.includes("regi"))
      filterRegion(searchText, true)
  else if ( text.includes("prov") )
      filterProv(searchText, true)    
  else if ( text.includes("comision") )
      filterComisiones(searchText, true)    
  else {
      entityList.innerHTML = ''
      filterAsams(searchText, false)
      filterPartidos(searchText, false)
      filterRegion(searchText, false)
      filterProv(searchText, false)
      //filterComisiones(searchText, false)
  }
  
}

filterAsams = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')

  let matches = Object.values(nodosActuales).filter(sess => {
      return sess.id.match(regex)
  })
  console.log("asams filtrados: ", matches)
  //if (matches.length > 5)
  //    matches = matches.slice(0, 5)
  //outputAsambs(matches)
  initializeList(matches)
}

filterPartidos = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
  //sess.partido == text
  
  let matches = []
  matches = Object.keys(partidos).filter(partido => {
    return partido.match(regex)
  })

  //console.log("matches list partidos:", matches)
  let results;
  if(matches.length > 1){
    results = buscarPartidosOpciones(matches)
    outputEntidades(results, 'Partido')
  }
  else if(matches.length == 1){
    results = buscarPartidosOpciones(matches)
    outputEntidades(results, 'Partido')
    let asambsunitario = results[0][1]
    initializeList(asambsunitario)
  }

}

buscarPartidosOpciones = (list) => {
  let data = []
  list.forEach( op => {
    let partido = op.toLowerCase()
    let asambsPartidos = Object.values(nodosActuales).filter(sess => {
      return sess.partido.match(partido)
    })
    let info = []
    info.push(partido)
    info.push(asambsPartidos)
    data.push(info)
  })
  //console.log("Lista de lista:", data)
  return data
  
}

filterRegion = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')

  let matches = []
  matches = Object.keys(regiones).filter(region => {
    return region.match(regex)
  })

  let results;
  if(matches.length > 1){
    results = buscarRegionOpciones(matches)
    outputEntidades(results, 'Región')
  }
  else if(matches.length == 1){
    results = buscarRegionOpciones(matches)
    outputEntidades(results, 'Región')
    let asambsunitario = results[0][1]
    initializeList(asambsunitario)
  }

}

buscarRegionOpciones = (list) => {
  let data = []
  list.forEach( op => {
    let partido = op.toLowerCase()
    let asambsRegion = Object.values(nodosActuales).filter(sess => {
      return sess.region.match(partido)
    })
    let info = []
    info.push(partido)
    info.push(asambsRegion)
    data.push(info)
  })
  //console.log("Regiones:", data)
  return data
  
}

filterProv = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
  
  let matches = []
  matches = Object.keys(provincias).filter(prov => {
    return prov.match(regex)
  })
  
  console.log("matches:", matches, regex)
  
  let results;
  if(matches.length > 1){
    results = buscarProvinciasOpciones(matches)
    outputEntidades(results, 'Provincia')
  }
  else if(matches.length == 1){
    results = buscarProvinciasOpciones(matches)
    outputEntidades(results, 'Provincia')
    let asambsunitario = results[0][1]
    initializeList(asambsunitario)
  }

}


buscarProvinciasOpciones = (list) => {
  let data = []
  list.forEach( op => {
    let partido = op.toLowerCase()
    let asambsRegion = Object.values(nodosActuales).filter(sess => {
      return sess.provincia.match(partido)
    })
    let info = []
    info.push(partido)
    info.push(asambsRegion)
    data.push(info)
  })
  console.log("Provincias:", data)
  return data
  
}



/**Checkear las entidades y meterlas al canvass */
function onGetIdList(id, x , y){
  console.log("ADD:", id, x , y)
  let idnew = id.substring(1)
  console.log(idnew)

  let element = asambleistas[idnew]

  if(element.visitado == false){
    if (!(element.numeroId in entidades)){
      entidades[element.numeroId] = element
      entidades[element.numeroId].xOffset = x +170
      entidades[element.numeroId].yOffset = y +80
      console.log(entidades, d3.values(entidades).length)
    }
    else{
      entidades[element.numeroId].visitado = true
    }
    element.visitado = true
    console.log("checked", element.visitado);
    updateNodes()
  }
  else {
    entidades[element.numeroId].visitado = false
    updateNodes()
  }

  /**
   *  if (document.getElementById(id).checked) {
    element.visitado = true
    if (!(element.numeroId in entidades)){
      entidades[element.numeroId] = element
      console.log(entidades, d3.values(entidades).length)
    }
    else{
      entidades[element.numeroId].visitado = true
    }

    console.log("checked", element.visitado);
    updateNodes()

  } else {

    entidades[element.numeroId].visitado = false
    console.log("uncheck", entidades[element.numeroId].visitado)
    updateNodes()

  }
   */
  
}

function updateNodes () {

  let newnodes = []
  for (let key in entidades) {
    if(entidades[key].visitado == true) newnodes.push(entidades[key])
  }
  groups = _groups()
  nodes = createNodes(newnodes, groups)
  colorMap = $('#colores-select').val() 

  entityList.innerHTML = ''
  initializeList(nodosActuales)
  d3.timeout(chart, 500)
  //updateTable(nodes)
}

function outputEntidades (matches, option) {
  /**<div  class=" card py-2 </div> "> */
  if (matches.length > 0){
    const html = matches.map(match => 
      `<div class="d-flex flex-column ml-4">
       
         <div class=" d-flex flex-row l mb-1 " style="align-items: center;">

          <svg height="12" width="12" class="mr-3"><circle cx="5" cy="5" r="5"  fill="${color(match[0], colorMap)}" /></svg>
          <span class="mr-2" style="color: #034EA2; font-weight: bold; text-transform:capitalize"> ${match[0]} </span>
          
         </div>
         <div class=" d-flex flex-row mb-1 ml-4" style="align-items: center;">
         <span class="mr-2" style="color: #54575b; font-weight: bold; text-transform:capitalize">  (${option}) </span>
         <span class="mr-2" style="color: #54575b ; font-weight: bold; text-transform:capitalize" > ${match[1].length} Asambleistas</span> 
         </div>
         
      </div>`
    ).join('');
    //console.log(html)
    entityList.innerHTML += html
  } 
}

/**Fin de lista de asamblelistas */


/** Funciones para el buscador de asambleistas dentro del canvas */

const asambslist = document.getElementById('asambleistasList');
const pinnedlist = document.getElementById('pinnedList');
let pinnedElements = {}
let matches = []

function buscarAsambleistas (searchText, nodos) {
    asambslist.innerHTML = ' '
    matches = []
    showPinnedAssamb()
    if (searchText == '')
        asambslist.innerHTML = ' '
    else {
        console.log(searchText)
        //console.log(nodos)
        const regex = new RegExp(`\\b.*${searchText}.*?\\b`, 'gi')

        matches = nodos.filter(sess => {
            return sess.idnombre.match(regex) && sess.labelFlag == false
        })
        LOGO && console.log("Asambleistas: ", matches)
        if (matches.length > 15)
            matches = matches.slice(0, 15)

        showSessionAssembly(matches)
    }
}

showSessionAssembly = (matches) => {
    asambslist.innerHTML = ' '
    if (matches.length > 0){
        const html = matches.map(match => 
            `<div style="display: ${!(match.numeroid in pinnedElements) ? 'block' : 'none'};">
                <div class="d-flex flex-column ml-4">

                    <div class= "d-flex flex-row  list-group-item list-group-item-action mb-1 ">
                        <input class="mr-2" type="checkbox" id=${match.numeroid}  onclick="getIdAssambly(this.id)"></input>
                        <span style="color: #54575b; font-weight: bold; text-transform:capitalize"> ${match.nombre} </span>
                    </div>
                </div>
            </div>`
        ).join('');
        //console.log(html)
        asambslist.innerHTML += html
    } 
}

showPinnedAssamb = () => {
    
    pinnedlist.innerHTML = ''
    let list = Object.values(pinnedElements)
    console.log(pinnedElements)
    

    if (list.length > 0){
        const html = list.map(element => 
            `<div class="d-flex flex-column ml-4">
                
                <div  class=" d-flex flex-row list-group-item list-group-item-action mb-1" style="align-items: center;">

                    <input class="mr-2" type="checkbox" id=${element.numeroId } onclick="removePinned(this.id)" checked></input>
                    <span style="color: #54575b; font-weight: bold; text-transform:capitalize"> ${element.nombre} </span>
                </div>
            </div>`
        ).join('');

        //console.log(html)
        pinnedlist.innerHTML += html
    }
    
}

getIdAssambly = (id) => {
    console.log(id)
    
    if (id in pinnedElements){
        console.log("en uso")
    }
    else {
        let asambleista = asambleistas[id]
        console.log('asambleista: ', asambleista)
        pinnedElements[id] = asambleista
        
        console.log("entidad:" , entidades[id])
        entidades[id].labelFlag = true
        d3.select('#node' + asambleista.numeroId).attr("stroke", "orange").attr("stroke-width", 3.0) // #f6c23e
        d3.select('#text' + asambleista.numeroId).attr("visibility", "visible")

        showPinnedAssamb()
        showSessionAssembly(matches)
    }

}

removePinned = (id) => {
    
    d3.select('#node' + id).attr("stroke", "#fff").attr("stroke-width", 0)
    d3.select('#text' + id).attr("visibility", "hidden")
    entidades[id].labelFlag = false
    delete pinnedElements[id]
    showPinnedAssamb()
    showSessionAssembly(matches)
    //console.log(entidades)
}

fueradelbuscador = () => {
    pinnedlist.innerHTML = ''
    asambslist.innerHTML = ' '
}

/** Fin del buscador de asambleistas */

/**Zona para buscar votaciones */

const votesList = document.getElementById('votesList');

function searchSesiones(searchText) {
    
  let word = validateInput(searchText)
  LOGO && console.log("search: ", word)
  let ses = Object.values(sesiones)
  
  let matches = filterData(word, ses)
 
  if (searchText.length === 0) {
      matches = []
      votesList.innerHTML = ''
  }
  if (matches.length > 13)
      matches = matches.slice(0, 13)

      LOGO && console.log("data:", matches)
  outputSesiones(matches)
}
//${match.asunto.substr(0, 200)}
function outputSesiones(matches) {
  if (matches.length > 0) {
      const html = matches.map(match =>
              `<div class="d-flex flex-row">
        <a   id=${match.sesId}
        class="list-group-item list-group-item-action mb-1 " >
            ${ sesFlag ? ' ': `<span style="color: #034EA2; font-weight: bold;"> Sesión ${match.sesion}</span>`}
            <span style="color: #034EA2; font-weight: bold;"> Votación ${match.votacion}</span>
            <span style="color: #54575b;"> (${match.fecha} ${match.hora}): </span>
            <span> ${ match.bold ? match.bold : match.asunto } ... </span> 
        </a>
      </div>`).
              join('');
      //console.log(html)
      // matchList.innerHTML = html 
      votesList.innerHTML = html
  } else{
      const noData = ` <div class="d-flex justify-content-center" style="margin: auto">
                          <span style="color: #034EA2; font-weight: bold; margin-top: 20px;"> No hay resultados </span>
                      </div>`
      votesList.innerHTML = noData;
  }
}

//valida si ingreso algun numero que pueda ser una sesion
function validateInput (text) {
  let value = text
  let searchSes = text.split(" ")
  numberFlag = false
  //asuntoFlag = true
  searchSes.forEach(function (word) {
      let num1 = parseInt(word)
      LOGO && console.log(num1)
      if(!isNaN(num1)){
          LOGO && console.log("Es un numero: ", num1)
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
  LOGO && console.log("Sesiones:", matches1)
  LOGO && console.log("Asuntos:", matches2)
  if(matches1.length > 0) {
      //sesFlag = true
      matches1.sort((a,b) => (a.votacion > b.votacion) ? 1 : ((b.votacion > a.votacion) ? -1 : 0))
      return matches1
  }
  else{
      LOGO && console.log(matches2)
      let words = matches2.map(match => {
          var newtext = match.asunto.replace(text, '<b>'+text+'</b>')
          //console.log(newtext)
          match.bold = newtext
          return match
      })

      LOGO && console.log(words)

      return words
  }
  
}