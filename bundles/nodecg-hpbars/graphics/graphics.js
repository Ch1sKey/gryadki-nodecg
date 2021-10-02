const idElem = document.getElementById('id')
const hpElem = document.getElementById('hp')
const colorElem = document.getElementById('color')
const dataElem = document.getElementById('data')
const nameElem = document.getElementById('name')
const barContainerElem = document.querySelector('.bar-container');
const currentHpElem = document.getElementById('currentHp')
const maxHpElem = document.getElementById('maxHp')
const hpScrollElem = document.querySelector('.bar-snake');
const hpScrollSecondElem = document.querySelector('.bar-snake-second');

//config
const debugMode = false

//utils
function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
function getId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

const currentID = getId();
let currentBarData = {
  name: 'HP Bar',
  id: currentID,
  color: getRandomColor(),
  hp: 50,
  maxHp: 50
}


function render(newData, oldData) {
  let oldHp = newData.hp
  if(oldData) {
    oldHp = oldData.hp;
  }
  const { id, hp, maxHp, color, name } = newData;
  dataElem.style.display = debugMode ? 'block' : 'none';
  idElem.innerText = id;
  hpElem.innerText = hp;
  colorElem.innerText = color;
  dataElem.style.backgroundColor = color;
  nameElem.innerText = name;
  currentHpElem.innerText = hp,
  maxHpElem.innerText = maxHp

  const hpPercentsDamaged = clamp(100 - Math.floor(hp / maxHp * 100), 0, 100);
  hpScrollElem.style.transform = `translateX(-${hpPercentsDamaged}%)`
  hpScrollSecondElem.style.transform = `translateX(-${hpPercentsDamaged}%)`        

}

function register(currentBarData) {
  nodecg.sendMessage('NEW_BAR', currentBarData);
  render(currentBarData);
}

register(currentBarData);
nodecg.listenFor('RELOAD_BARS', () => {
  register(currentBarData);
});


nodecg.listenFor('UPDATE', listOfBars => {
  console.log(listOfBars, currentID)
  const newBarData = listOfBars.find(bar => bar.id === currentID);
  if(newBarData) {
    const oldBarData = {...currentBarData};
    currentBarData = {...newBarData};
    render(currentBarData, oldBarData);
  }
})


function pingAnimation() {
  barContainerElem.classList.add('ping-animation');
  setTimeout(() => {
    barContainerElem.classList.remove('ping-animation');
  }, 300)
}

nodecg.listenFor('PING', id => {
  console.log(id, currentID)
  if(id === currentID) {
    debounce(pingAnimation())
  }
})

window.addEventListener('beforeunload', () => {
  nodecg.sendMessage('REMOVE_BAR', currentID);
})


// This handle probably would not work...
window.addEventListener('obsExit', () => {
  nodecg.sendMessage('REMOVE_BAR', currentID);
})

const dataNode = document.getElementById('data')
nodecg.listenFor('CLOSE', data => {
  dataNode.innerText = data;
})