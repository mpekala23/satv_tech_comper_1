function getProgressBox(id, val) {
  if(window.editing) {
    return "<span id='" + id + "-progress-edit' onclick=\"editProgress('" + id + "')\" class='editable'>" + val + "%</span>";
  } else {
    return val + "%";
  }
}

function renderProgressbar(id, val) {
  let extra_class = "";
  let style = "";
  if(id == "master") {
    extra_class = "progress-bar-success";
    style = "style='margin-bottom:5em'";
  }
  let output = "<div class=progress " + style + "><div id='" + id + "-progressbar' class='progress-bar " + extra_class + " progress-bar-striped active' role=progressbar aria-valuemin=0 aria-valuemax=100 style='width:" +
    parseInt(val) + "%'>" + getProgressBox(id, val) + "</div></div>";

  return output;
}

function renderMasterProgress(val) {
  return "<div class=master_progress_bar><div class=text-center><hr><h2><b>Master Progress</b></h2><hr></div>" + renderProgressbar("master", val) + "</div>";
}

function editProgress(id) {
  let val = parseFloat($("#" + id + "-progress-edit").html());
  $("#" + id + "-progress-edit")[0].outerHTML = "<input id='edit_progress_" + id + "' class='edit_progress' onkeypress=\"setProgressEvent('" + id + "')\" onblur=\"setProgress('" + id + "')\" value='" + val + "'></input>"; // Shitty ass coding
  setTimeout(() => {
    $("#edit_progress_" + id).focus();
  }, 200);
}

function setProgress(id) {
  let val = parseFloat($("#edit_progress_" + id).val());
  if(isNaN(val) || val < 0 || val > 100) {
    event.preventDefault();
    alert("Progress value must be between 0 and 100");
    return;
  }

  if(id === "master") {
    edited();
    window.progressDataEditing.master = val;
  } else {
    setProgressItem(id, { progress_val: val });
  }
  $("#edit_progress_" + id)[0].outerHTML = getProgressBox(id, val);
  $("#" + id + "-progressbar").css("width", parseInt(val) + "%");
}

function setProgressEvent(id) {
  if(event.keyCode == 13) {
    $("#edit_progress_" + id).blur();
  }
}

function getTitleBox(id, val) {
  if(window.editing) {
    return "<span id='" + id + "-title-edit' onclick=\"editTitle('" + id + "')\" class='editable'>" + val + "</span>";
  } else {
    return val;
  }
}

function renderTitle(id, title) {
  return getTitleBox(id, title);
}

function editTitle(id) {
  let val = $("#" + id + "-title-edit").html();
  $("#" + id + "-title-edit")[0].outerHTML = "<input id='edit_title_" + id + "' class='edit_title' onblur=\"setTitle('" + id + "')\" class='edit_title' value='" + val + "'></input>"; // Shitty ass coding
  setTimeout(() => {
    $("#edit_title_" + id).focus();
  }, 200);
}

function setTitle(id) {
  let val = $("#edit_title_" + id).val();
  if(!val) {
    event.preventDefault();
    alert("Title cannot be empty");
    return;
  }

  setProgressItem(id, { title: val });
  $("#edit_title_" + id)[0].outerHTML = getTitleBox(id, val);
  console.log(window.progressDataEditing);
}

function getPointBox(id, val) {
  if(window.editing) {
    return "<span id='" + id + "-point-edit' onclick=\"editPoint('" + id + "')\" class='editable'>" + val + "</span>";
  } else {
    return val;
  }
}

function renderPoint(id, point) {
  return "<li id='point-li-" + id + "' class='point-box'>" + renderRemovePointButton(id) + "<strong>" + getPointBox(id, point) + "</strong></li>";
}

function editPoint(id) {
  let val = $("#" + id + "-point-edit").html();
  $("#" + id + "-point-edit")[0].outerHTML = "<textarea id='edit_point_" + id + "' class='edit_point' onblur=\"setPoint('" + id + "')\" class='edit_point' rows='10'>" + val + "</textarea>"; // Shitty ass coding
  setTimeout(() => {
    $("#edit_point_" + id).focus();
  }, 200);
}

function setPoint(id) {
  let val = $("#edit_point_" + id).val();
  if(!val) {
    event.preventDefault();
    alert("Bullet point cannot be empty");
    return;
  }

  let info = getPointInfo(id);
  setProgressItem(info.item_id, { points: [ { idx: info.idx, val: val } ] });
  console.log(window.progressDataEditing);
  $("#edit_point_" + id)[0].outerHTML = getPointBox(id, val);
}

function renderRemovePointButton(id) {
  if(!window.editing) {
    return "";
  }

  return "<div onclick=\"removePoint('" + id + "')\" class='remove-button remove-button-small'><img width=10 height=10 src='/static/images/remove.png'></div>";
}

function renderRemoveButton(id) {
  if(!window.editing) {
    return "";
  }

  return "<div onclick=\"removeItem('" + id + "')\" class='remove-button'><img width=20 height=20 src='/static/images/remove.png'></div>";
}

function renderItemProgress(item) {
  let output = "<div id='panel-" + item._id + "' class='panel panel-default'>" + 
    renderRemoveButton(item._id) + "<div class=panel-heading><h3 style='margin-bottom:.5em'>" +
    renderTitle(item._id, item.title) + "</h3>" + renderProgressbar(item._id, item.progress_val) + "</div><div class=panel-body><ul>";

  for(let point in item.points) {
    let p_id = item._id + "_" + point;
    if(window.editing) {
      output += renderAddPointButton(p_id);
    }
    output += renderPoint(p_id, item.points[point]);
  }
  if(window.editing) {
    output += renderAddPointButton("last-" + item._id);
  }

  output += "</ul></div></div>";

  return output;
}

function renderItemsTitle() {
  return "<div class=text-center><hr><h2><b>Itemized Progress</b></h2><hr></div>";
}

function getNewId() {
  return (new Date()).getTime();
}

function addItem(id) {
  let new_item = {
    _id: getNewId(),
    title: "Insert title",
    fresh: true,
    progress_val: 50.0,
    points: []
  }
  console.log("New id: " + new_item._id);
  let newRender = renderAddButton(new_item._id) + renderItemProgress(new_item);
  if(id == "last") {
    window.progressDataEditing.items.push(new_item);
    edited();
    $(newRender).insertBefore("#add-last");
  } else {
    window.progressDataEditing.items.splice(id, 0, new_item);
    edited();
    $(newRender).insertBefore($("#panel-" + id).prev());
    console.log(window.progressDataEditing);
  }
}

function getPointInfo(id) {
  let info = id.split("_");
  let item_id = info[0];
  let idx = parseInt(info[1]);

  return { idx: idx, item_id: item_id };
}

function addPoint(id) {
  let data = window.progressDataEditing;
  let item_id = "";
  let new_id = "";
  let item_idx = 0;
  if(id.substring(0, 4) == "last") {
    item_id = id.substring(5);
  } else {
    let info = getPointInfo(id);
    item_id = info.item_id;
    item_idx = info.idx;
    new_id = info.item_id + "_" + info.idx;
  }

  let itemData = null;
  let new_val = "Insert text here";
  for(let item of data.items) {
    if(item._id == item_id) {
      itemData = item;
    }
  }

  if(id.substring(0, 4) == "last") {
    new_id = item_id + "_" + itemData.points.length;
    let newRender = renderAddPointButton(new_id) + renderPoint(new_id, new_val);
    itemData.points.push(new_val);
    $(newRender).insertBefore("#add-last-" + item_id);
  } else {
    let newRender = renderAddPointButton(new_id) + renderPoint(new_id, new_val);
    console.log(item_idx);
    let update_lis = [];
    for(let i = item_idx; i < itemData.points.length; i++) {
      console.log("Getting " + i);
      update_lis.push(document.getElementById("point-li-" + item_id + "_" + i));
    }
    for(let i = item_idx; i < itemData.points.length; i++) {
      let updated = item_id + "_" + (i + 1);
      console.log(updated);
      let li = update_lis[i - item_idx];
      li.id = "point-li-" + updated;
      li.children[0].onclick = () => { removePoint(updated); };
      li.children[1].children[0].id = updated + "-point-edit";
      li.children[1].children[0].onclick = () => { editPoint(updated); };
      li.previousSibling.id = "add-" + updated;
      li.previousSibling.children[0].onclick = () => { addPoint(updated); };
    }
    itemData.points.splice(item_idx, 0, new_val);
    edited();
    setTimeout(() => {
      $(newRender).insertBefore($("#point-li-" + item_id + "_" + (item_idx + 1)).prev());
    }, 100);
  }
  console.log(window.progressDataEditing);
}

function renderAddButton(id) {
  return "<div id='add-" + id + "' class='add-button'><img onclick=\"addItem('" + id + "')\" width=20 height=20 src='/static/images/add.png'></div>";
}

function renderAddPointButton(id) {
  return "<div id='add-" + id + "' class='add-button add-button-small'><img onclick=\"addPoint('" + id + "')\" width=15 height=15 src='/static/images/add.png'></div>";
}

function renderProgress() {
  let data = window.progressDataEditing;

  let output = renderMasterProgress(data.master);

  output += renderItemsTitle(); 

  for(let item in data.items) {
    if(window.editing) {
      output += renderAddButton(data.items[item]._id);
    }
    output += renderItemProgress(data.items[item]);
  }
  if(window.editing) {
    output += renderAddButton("last");
  }

  $("#progress-wrap").html(output);
}

function setProgressItem(id, data) {
  let alldata = window.progressDataEditing;

  for(let i = 0; i < alldata.items.length; i++) {
    if(alldata.items[i]._id == id) {
      if(data.points) {
        for(let p of data.points) {
          alldata.items[i].points[p.idx] = p.val;
        }
        delete data.points;
      }
      alldata.items[i] = Object.assign(alldata.items[i], data);
      edited();
    }
  }
}

function removeItem(id) {
  let alldata = window.progressDataEditing;

  for(let i = 0; i < alldata.items.length; i++) {
    if(alldata.items[i]._id == id) {
      alldata.items.splice(i, 1);
      edited();
    }
  }

  $("#panel-" + id).prev().remove();
  $("#panel-" + id).remove();
}

function removePoint(id) {
  let alldata = window.progressDataEditing;

  let info = getPointInfo(id);

  console.log("Remove " + id);

  $("#point-li-" + id).prev().remove();
  $("#point-li-" + id).remove();

  let itemData = null;
  for(let i = 0; i < alldata.items.length; i++) {
    if(alldata.items[i]._id == info.item_id) {
      itemData = alldata.items[i];
    }
  }

  let update_lis = [];
  let item_idx = info.idx;
  let item_id = info.item_id;

  setTimeout(() => {
    console.log("Remove item_idx: " + item_idx);
    for(let i = item_idx + 1; i < itemData.points.length; i++) {
      update_lis.push(document.getElementById("point-li-" + item_id + "_" + i));
    }
    for(let i = item_idx + 1; i < itemData.points.length; i++) {
      let updated = item_id + "_" + (i - 1);
      console.log("Remove updated: " + updated);
      let li = update_lis[i - item_idx - 1];
      li.id = "point-li-" + updated;
      li.children[0].onclick = () => { removePoint(updated); };
      li.children[1].children[0].id = updated + "-point-edit";
      li.children[1].children[0].onclick = () => { editPoint(updated); };
      li.previousSibling.id = "add-" + updated;
      li.previousSibling.children[0].onclick = () => { addPoint(updated); };
    }

    itemData.points.splice(item_idx, 1);
    edited();
    console.log(window.progressDataEditing);
  }, 100);
}

function loadProgress() {
  $.get("/get_progress", (data) => {
    window.progressData = data;
    window.progressDataEditing = JSON.parse(JSON.stringify(data)); // Hack
    renderProgress();
  });
}

function startEdit() {
  $("#edit-button").hide();
  $("#edit-cancel").show();
  $("#edit-save").show();
  window.editing = true;
  renderProgress();
}

function saveEdit() {
  console.log("SAve");
  $.post("/save_progress", window.progressDataEditing, () => {
    $("#progress-wrap").html("");
    $("#edit-button").show();
    $("#edit-save").hide();
    $("#edit-cancel").hide();
    window.editing = false;
    loadProgress();
  }).fail(() => {
    alert("Save changed failed. Please try again");
  });
}

function edited() {
}

function saveCancel() {
  $("#edit-button").show();
  $("#edit-save").hide();
  $("#edit-cancel").hide();
  window.editing = false;
  renderProgress();
}

let prev_onload = window.onload;
window.onload = (e) => {
  if(prev_onload) {
    prev_onload(e);
  }
  $.get("/check_logged", (res) => {
    console.log("Logged: " + res);
    window.editing = false;
    loadProgress();
    if(res == "true") {
      $("#edit-buttons").show();
      $("#edit-save").click(saveEdit);
      $("#edit-cancel").click(saveCancel);
      $("#edit-button").click(startEdit);
    }
  });
}
