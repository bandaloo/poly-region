class MediaSubCard extends SubCard {
  /**
   * Constructor for media card that will show audio and images when it is
   * rebuilding from a downloaded file
   * @param {RegionCard} superCard
   * @param {string[]} [audio]
   * @param {string[]} [images]
   */
  constructor(superCard, audio, images) {
    super(superCard, "block");

    // setting up audio file input
    this.audioFileInput = document.createElement("input");
    this.audioFileInput.type = "file";
    this.audioFileInput.accept = "audio/*";

    // TODO check if these are needed
    this.audioFileInput.id = "audio_id_" + superCard.hash;
    this.audioFileInput.name = "audio_name_" + superCard.hash;

    let removeFuncs = this.makeInternalDiv(
      "Audio file",
      this.audioFileInput,
      audio,
      regions[superCard.hash].audio
    );

    // clear the original tags when audio file input is updated
    this.audioFileInput.onchange = () => {
      for (let i = 0; i < removeFuncs.length; i++) {
        removeFuncs[i]();
      }
    };

    // setting up image file input
    this.imageFileInput = document.createElement("input");
    this.imageFileInput.type = "file";
    this.imageFileInput.accept = "image/*";
    this.imageFileInput.multiple = true;

    // TODO check if these are needed
    this.imageFileInput.id = "image_id_" + superCard.hash;
    this.imageFileInput.name = "image_name_" + superCard.hash;

    let transcriptFlex = document.createElement("div");
    transcriptFlex.classList.add("flex");

    let transcriptHeader = document.createElement("h3");
    transcriptHeader.innerHTML = "Transcript";

    this.transcriptArea = document.createElement("textarea");
    this.transcriptArea.classList.add("hundredwidth", "transcriptarea");
    this.transcriptArea.rows = 6;

    let transcriptBox = document.createElement("div");
    transcriptBox.classList.add("sidebox");

    transcriptBox.appendChild(transcriptHeader);
    transcriptFlex.appendChild(this.transcriptArea);
    transcriptBox.appendChild(transcriptFlex);

    this.makeInternalDiv(
      "Image files",
      this.imageFileInput,
      images,
      regions[superCard.hash].images
    );

    this.enclosingDiv.appendChild(transcriptBox);

    this.setToggleButton(superCard.mediaButton, "Hide Media");
  }

  /**
   * Makes internal file section div
   * @param {string} name
   * @param {HTMLInputElement} input
   * @param {string[]} [filenames]
   * @param {string[]} [regionFiles] - the region files to remove from
   */
  makeInternalDiv(name, input, filenames, regionFiles) {
    let internalDiv = document.createElement("div");
    internalDiv.classList.add("sidebox");
    let nameHeader = document.createElement("h3");
    nameHeader.innerHTML = name;
    internalDiv.appendChild(nameHeader);
    internalDiv.appendChild(input);
    this.enclosingDiv.appendChild(internalDiv);

    let removeFuncs = [];
    // add the file names
    if (filenames !== undefined) {
      for (let i = 0; i < filenames.length; i++) {
        let filenameDiv = document.createElement("div");
        filenameDiv.classList.add("sidebox", "flex");
        let filenameText = document.createElement("p");
        filenameText.classList.add("fillwidth", "filename");
        filenameText.innerHTML = filenames[i];
        let xButton = makeXButton();
        // remove the file from the region data when x is clicked
        const clickFunc = () => {
          this.removeFile(regionFiles, filenames[i]);
          filenameDiv.parentNode.removeChild(filenameDiv);
        };

        xButton.onclick = clickFunc;

        filenameDiv.appendChild(filenameText);
        filenameDiv.appendChild(xButton);
        internalDiv.appendChild(filenameDiv);

        removeFuncs.push(clickFunc);
      }
    }
    return removeFuncs;
  }

  /**
   * Remove filename from list of filenames
   * @param {string[]} list
   * @param {string} filename
   */
  removeFile(list, filename) {
    // remove without reassignment with splice
    for (let i = 0; i < list.length; i++) {
      if (list[i] === filename) {
        list.splice(i, 1);
      }
    }
  }
}
