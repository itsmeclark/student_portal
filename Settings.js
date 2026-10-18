if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

function showToast(id){
  var toast = document.getElementById(id);
  toast.classList.add('show');
  setTimeout(function(){ toast.classList.remove('show'); }, 2200);
}

var tabButtons = document.querySelectorAll('.tab');
tabButtons.forEach(function(btn){
  btn.addEventListener('click', function(){
    var name = btn.getAttribute('data-tab');

    document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });

    btn.classList.add('active');
    document.getElementById('panel-' + name).classList.add('active');
  });
});

document.getElementById('saveNotif').addEventListener('click', function(){

  var prefs = {
    email:    document.getElementById('n-email').checked,
    sms:      document.getElementById('n-sms').checked,
    push:     document.getElementById('n-push').checked,
    grades:   document.getElementById('n-grades').checked,
    announce: document.getElementById('n-announce').checked,
    enroll:   document.getElementById('n-enroll').checked,
    tuition:  document.getElementById('n-tuition').checked
  };
  console.log('Notification preferences:', prefs);
  showToast('notifToast');
});

document.getElementById('savePrivacy').addEventListener('click', function(){

  console.log('Two-factor enabled:', document.getElementById('p-2fa').checked);
  showToast('privacyToast');
});

document.getElementById('endSession').addEventListener('click', function(){

  var row = document.getElementById('session2');
  row.parentNode.removeChild(row);
});

var deleteBtn = document.getElementById('deleteBtn');
var deleteTimer = null;
deleteBtn.addEventListener('click', function(){
  if(deleteBtn.getAttribute('data-confirm') !== 'yes'){
    deleteBtn.setAttribute('data-confirm', 'yes');
    deleteBtn.textContent = 'Click again to confirm';
    deleteTimer = setTimeout(resetDeleteBtn, 3000);
  } else {
    clearTimeout(deleteTimer);
    resetDeleteBtn();

    alert('Account deletion is not connected to the backend yet.');
  }
});
function resetDeleteBtn(){
  deleteBtn.setAttribute('data-confirm', 'no');
  deleteBtn.textContent = 'Delete Account';
}

document.querySelectorAll('.faq-q').forEach(function(q){
  q.addEventListener('click', function(){
    q.parentNode.classList.toggle('open');
  });
});

var rating = 0;
var starButtons = document.querySelectorAll('.star');

function paintStars(){
  starButtons.forEach(function(s){
    var v = parseInt(s.getAttribute('data-value'), 10);
    if(v <= rating){ s.classList.add('on'); } else { s.classList.remove('on'); }
  });
}
starButtons.forEach(function(s){
  s.addEventListener('click', function(){
    rating = parseInt(s.getAttribute('data-value'), 10);
    paintStars();
    document.getElementById('ratingError').classList.remove('show');
  });
});

document.getElementById('sendFeedback').addEventListener('click', function(){
  var message = document.getElementById('fbMessage').value.trim();
  var ok = true;

  if(rating === 0){
    document.getElementById('ratingError').classList.add('show');
    ok = false;
  }
  if(message === ''){
    document.getElementById('messageError').classList.add('show');
    ok = false;
  } else {
    document.getElementById('messageError').classList.remove('show');
  }
  if(!ok){ return; }

  console.log('Feedback:', {
    rating: rating,
    category: document.getElementById('fbCategory').value,
    message: message
  });

  showToast('feedbackToast');
  document.getElementById('fbMessage').value = '';
  rating = 0;
  paintStars();
});

var MANAGERS = [
  { name: "Enopia, Gemar A.",          role: "Oversees the group's overall progress and deliverables." },
  { name: "Arcala, Ashley Rochell B.", role: "Oversees the group's overall progress and deliverables." }
];

var LEADERS = [
  "Berdin, Ritzelyn S.",     "Jabaybay, John Rey C.",
  "Cagang, Nino Cesar M.",   "Layos, Clark C.",
  "Capul, Roland B.",        "Libusada, Jason Scott D.",
  "Cuizon, Maria Sofia E.",  "Rona, Keith C.",
  "Flores, Jomar R.",        "Segales, Chris Niño G."
];

var MEMBERS = [
  "Alga, Daryl A.",               "Mendoza, Rica Z.",
  "Apolinar, Geean P.",           "Mina, Beveymae E.",
  "Aranas, Karl Matthew G.",      "Pahilangco, Glyan Marie L.",
  "Bayrante, Jamir F.",           "Panlaan, Geoffrey Jr. T.",
  "Bitos, Meil John",             "Pojas, Ashli Pauly C.",
  "Cabilao, Gevirick Vincent",    "Polosan, Rhea Lyn C.",
  "Dandan, Reese Nesniel A.",     "Ponce, John Lloyd P.",
  "Dela Cruz, Icy Jake A.",       "Rivera, John Ashley C.",
  "Dela Cruz, Jay Kyle A.",       "Romales, Eleiza Bell S.",
  "Donaire, Andoni Johannes P.",  "Ropal, Juricar L.",
  "Enriquez, Kirk Benedict A.",   "Rosales, Mark V.",
  "Esgana, Kylene B.",            "Sabado, Sunshine B.",
  "Estores, Adrian R.",           "Solasco, Mera N.",
  "Lawas, Rubbie Ann P.",         "Souquiño, Cris John D.",
  "Macalua, Jerome R",            "Suerte, John Francis A.",
  "Manguilimutan, Lovely Chloe N.", "Tecson, Vincemar S.",
  "Matugas, Joshryl A.",          "Villaneza, Philip A."
];

var PHOTOS = {

};

function makePerson(name, role, fullWidth){
  var item = document.createElement('div');
  item.className = 'rc-item' + (fullWidth ? ' full' : '');

  var pic = document.createElement('div');
  pic.className = 'pic';
  if(PHOTOS[name]){
    var img = document.createElement('img');
    img.src = PHOTOS[name];
    img.alt = name;
    pic.appendChild(img);
  }

  var info = document.createElement('div');
  var n = document.createElement('div');
  n.className = 'rc-name';
  n.textContent = name;
  info.appendChild(n);
  if(role){
    var r = document.createElement('div');
    r.className = 'rc-role';
    r.textContent = role;
    info.appendChild(r);
  }

  item.appendChild(pic);
  item.appendChild(info);
  return item;
}

function fillList(boxId, list, fullWidth){
  var box = document.getElementById(boxId);
  list.forEach(function(p){
    if(typeof p === 'string'){ box.appendChild(makePerson(p, '', fullWidth)); }
    else { box.appendChild(makePerson(p.name, p.role, fullWidth)); }
  });
}

fillList('rc-managers', MANAGERS, true);
fillList('rc-leaders', LEADERS, false);
fillList('rc-members', MEMBERS, false);
