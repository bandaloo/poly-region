const AdmZip = require("adm-zip");

/**
 * Extracts a zip to a directory
 * @param {string} zipName the full path to the zip
 * @param {string} dir the full path to the directory
 * @return {Promise<void>} an empty promise ;_;
 */
const extractZip = (zipName, dir) => {
  return new Promise((resolve, reject) => {
    let zip;
    try {
      zip = new AdmZip(zipName);
    } catch (err) {
      if (err) {
        reject({ status: 500, message: "Failed to unzip" });
      }
    }
    // extract all to the directory without overwriting
    // this prevents newer files and the newer metadata from being overwritten
    zip.extractAllToAsync(dir, false, err => {
      if (err) {
        // There's a weird error that's hard to reproduce (issue #74 on GitHub)
        // that causes this to fail even though the zip was successfully
        // extracted. Until I can find a solution we'll just ignore these errors
        // TODO fix this
        // reject({ status: 500, message: "Failed to unzip: " + err.message });
        // return;
      }
      resolve();
    });
  });
};

module.exports = extractZip;
