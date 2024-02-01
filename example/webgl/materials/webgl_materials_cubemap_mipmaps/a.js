// https://threejs.org/examples/textures/cube/angus/cube_m03_c00.jpg

const axios = require("axios").default;
const path = require("path");
const fs = require("fs");

const fileNames = [];
for (let level = 0; level <= 8; level++) {
  for (let face = 0; face <= 5; face++) {
    fileNames.push(`cube_m0${level}_c0${face}.jpg`);
  }
}

fileNames.forEach((fileName) => {
  const url = "https://threejs.org/examples/textures/cube/angus/" + fileName;
  // axios.get(url, { responseType: "stream" }).then((response) => {
  //   const p = path.join(__dirname, fileName);
  //   const writer = fs.createWriteStream(p);
  //   response.data.pipe(writer);
  //   writer.once("finish", () => {
  //     console.log(fileName);
  //   });
  // });
  axios.get(url, { responseType: "arraybuffer" }).then((response) => {
    const p = path.join(__dirname, fileName);
    fs.writeFileSync(p, response.data, { encoding: "binary" });
    console.log(fileName);
  });
});
