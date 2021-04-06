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


/**Conjunto de funciones para manejar la lista de asambleistas filtrados */

//let asambList = {}

let asambList = document.getElementById('asambleistas-list');

function initializeList (nodos) {
  let list = Object.values(nodos)

  //console.log("LIST:", list)
  //asambList.innerHTML = ''
  const html = list.map(element => 
    `<div class="d-flex flex-column ml-4">
        
        <div  class=" d-flex flex-row l mb-1" style="align-items: center;">

            <input class="mr-2" type="checkbox" id=${'A'+element.numeroId } onclick="onGetIdList(this.id)"  ${element.visitado ? 'checked' : ''} ></input>
            <span style="color: #54575b; font-weight: bold; text-transform:capitalize"> ${element.nombre} </span>
        </div>
    </div>`
  ).join('');

  //console.log("html:", html)
  asambList.innerHTML += html

}

function findEntities2 (searchText) {
  asambList.innerHTML = ''
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
      asambList.innerHTML = ''
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
  let asambsP = Object.values(nodosActuales).filter(sess => {
      return sess.partido.match(regex)
  })
  console.log("Partidos filtrados: ", asambsP)
  
  initializeList(asambsP)
}

filterRegion = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
 
  let asambsP = Object.values(nodosActuales).filter(sess => {
      return sess.region.match(regex)
  })

  console.log("Region filtrados: ", asambsP)
  
 initializeList(asambsP)
}

filterProv = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
  
  let asambsP = Object.values(nodosActuales).filter(sess => {
      return sess.provincia.match(regex)
  })
  
  console.log("Prov filtrados: ", asambsP)
  
  initializeList(asambsP)
}



function onGetIdList(id){
  console.log(id)
  let idnew = id.substring(1)
  console.log(idnew)

  let element = asambleistas[idnew]


  if (document.getElementById(id).checked) {
    element.visitado = true
    if (!(element.numeroId in entidades)){
      entidades[element.numeroId] = element
      console.log("Add entity: ",entidades, d3.values(entidades).length)
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

/**Fin de lista de asamblelistas */
