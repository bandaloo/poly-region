"use strict";

const form = /** @type {HTMLFormElement} */ (document.getElementById(
  "sideform"
));
const submitButton = /** @type {HTMLButtonElement} */ (document.getElementById(
  "submitbutton"
));
const jsonTextField = /** @type {HTMLInputElement} */ (document.getElementById(
  "metadata"
));

// determines whether to post to /upload or /edit
var downloaded = false;
var downloadedTourName = "";

/**
 * Action for hitting the upload button (really happens on form submit)
 * @param {Event} event
 */
function hitUpload(event) {
  jsonTextField.value = JSON.stringify(makeFileRegionData());
  event.preventDefault();
  let uploadMessage = document.getElementById("upload-message");
  uploadMessage.style.color = colorEnum.waiting;
  uploadMessage.innerHTML = "Uploading...";
  downloadedTourName = /** @type {HTMLInputElement} */ (document.getElementById(
    "upload-text"
  )).value;
  sendData(form);
}

form.addEventListener("submit", hitUpload);

/**
 * Sends data to one of the endpoints (either /edit or /upload)
 * @param {HTMLFormElement} form
 */
function sendData(form) {
  console.log("sending form");
  const xhr = new XMLHttpRequest();
  const arr = window.location.href.split("/");
  const url = arr[0] + "//" + arr[2];

  // Bind the FormData object and the form element
  const fd = new FormData(form);

  // successful data submission uploading tour
  xhr.addEventListener("load", event => {
    let uploadMsgElem = document.getElementById("upload-message");
    setZipMessage();
    statusChanger(uploadMsgElem, xhr.status, event, 201, text => {
      uploadMsgElem.innerHTML += " " + text;
    });
  });

  // error
  xhr.addEventListener("error", () => {
    errorChanger(document.getElementById("upload-message"));
  });

  // set up request (ternery for pointing to correct endpoint)
  xhr.open("POST", url + (downloaded ? "/edit" : "/upload"));
  xhr.send(fd);
}

/**
 * @typedef {Object} Coordinate - latitude and longitude position
 * @property {number} lat - latitude
 * @property {number} lng - longitude
 */
/**
 * @typedef {Object} RegionDatum - the metadata to describe a region
 * @property {string} name
 * @property {Coordinate[]} points
 * @property {string[]} audio
 * @property {string[]} images
 */
/**
 * @typedef {Object} RegionData - the metadata for the tour file
 * @property {RegionDatum[]} regions
 */
/**
 * Function for generating JSON data to associate files with regions
 * @return {RegionData}
 */
function makeFileRegionData() {
  /** @type {RegionData} */
  let data = { regions: [] };
  for (let hash in regions) {
    // real region to build a json region out of
    let realRegion = regions[hash];

    // json region to reflect the real region
    /** @type {RegionDatum} */
    let jsonRegion = {
      name: realRegion.name,
      points: realRegion.points,
      audio: realRegion.card
        .getAudioNames()
        .concat(realRegion.audio ? realRegion.audio : []),
      images: realRegion.card
        .getImageNames()
        .concat(realRegion.images ? realRegion.images : [])
    };

    // add the json region to json data
    data.regions.push(jsonRegion);
  }
  console.log(data);
  return data;
}

/**
 * Request download of tour from server
 * @param {string} tourName
 */
function requestTour(tourName) {
  const host = window.location.host;
  const xhr = new XMLHttpRequest();
  const scheme = window.location.href.split("/")[0];
  const str = `${scheme}//${host}/edit/${tourName}`;
  console.log(scheme);
  console.log(str);

  xhr.open("GET", str);

  // sucessfully downloaded tour
  xhr.addEventListener("load", event => {
    setZipMessage();
    // set to download mode
    downloaded = true;
    const uploadText = /** @type {HTMLInputElement} */ (document.getElementById(
      "upload-text"
    ));
    uploadText.readOnly = true;
    uploadText.value = downloadedTourName;

    statusChanger(
      document.getElementById("download-message"),
      xhr.status,
      event,
      200,
      rebuild
    );
  });

  xhr.addEventListener("error", () => {
    errorChanger(document.getElementById("download-message"));
  });

  xhr.send();
}

/**
 * Changes status of message area based on response from server
 * @param {HTMLElement} msgElem
 * @param {number} status
 * @param {ProgressEvent} event
 * @param {number} successCode
 * @param {Function} sCallback
 */
function statusChanger(msgElem, status, event, successCode, sCallback) {
  if (status === 404) {
    msgElem.innerHTML = "404 not found";
  }
  let responseText = /** @type {XMLHttpRequest} */ (event.target).responseText;
  console.log(downloaded);
  console.log(responseText);
  let parsedResponse;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch (err) {
    console.error("could not parse json from response");
    parsedResponse = { message: "Unexpected response" };
  }
  if (status !== successCode) {
    msgElem.style.color = colorEnum.failed;
    let message = parsedResponse.message;
    if (status === 404) {
      message = "404 not found";
    }
    msgElem.innerHTML = `There was a problem: ${message}`;
  } else {
    msgElem.style.color = colorEnum.successful;
    msgElem.innerHTML = "Success!";
    console.log(parsedResponse);
    sCallback(parsedResponse.message);
  }
}

function errorChanger(msgElem) {
  msgElem.style.color = colorEnum.failed;
  msgElem.innerHTML = "Network error";
}

function hitDownload() {
  // currently edited map will be posted to edit instead
  const tourName = /** @type {HTMLInputElement} */ (document.getElementById(
    "download-text"
  )).value;
  const processedTourName = processName(tourName);
  console.log(processedTourName);

  let downloadMessage = document.getElementById("download-message");
  downloadMessage.style.color = colorEnum.waiting;
  downloadMessage.innerHTML = "Downloading...";
  downloadedTourName = tourName;
  requestTour(processedTourName);
}

function setZipMessage() {
  const zipMessage = document.getElementById("zip-message");
  let link = window.location.href + "tour/" + processName(downloadedTourName);
  zipMessage.innerHTML = `Get&nbsp;<a href="${link}">${processName(
    downloadedTourName
  )}.zip</a>`;
}

function processName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[\/\?\=&]/g, "");
}
// set an onclick for the download button
document.getElementById("download-button").onclick = hitDownload;

form.addEventListener("keypress", event => {
  if (event.keyCode == 13) {
    event.preventDefault();
  }
});

document.getElementById("download-text").addEventListener("keypress", event => {
  if (event.keyCode == 13) {
    console.log("hit enter on download textbox");
    hitDownload();
  }
});

document.getElementById("upload-text").addEventListener("keypress", event => {
  if (event.keyCode == 13) {
    console.log("hit enter on upload textbox");
    hitUpload(event);
  }
});
