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
  //console.log("LIST:", list)
  //entityList.innerHTML = ''
  const html = list.map(element => 
    `<div class="d-flex flex-column ml-4">
        
        <div  class=" d-flex flex-row l mb-1" style="align-items: center;">

          <svg height="12" width="12" class="mr-3"><circle cx="5" cy="5" r="5"  fill="${color(element, colorMap)}" /></svg>

          <span style="color: #54575b; font-weight: bold; text-transform:capitalize"> ${element.nombre} </span>
        </div>
    </div>`
  ).join('');

  //console.log("html:", html)
  entityList.innerHTML += html

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
function onGetIdList(id){
  console.log(id)
  let idnew = id.substring(1)
  console.log(idnew)

  let element = asambleistas[idnew]


  if (document.getElementById(id).checked) {
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
  
}

function updateNodes () {

  let newnodes = []
  for (let key in entidades) {
    if(entidades[key].visitado == true) newnodes.push(entidades[key])
  }
  groups = _groups()
  nodes = createNodes(newnodes, groups)
  colorMap = $('#colores-select').val() 

  d3.timeout(chart, 400)
  updateTable(nodes)
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
