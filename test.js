const path = require("path");
const axios = require('axios');
const fs = require("fs");

async function downloadImage(url, filename) {
  const imagePath = path.join(__dirname, ".temp", filename); // Ensure the 'images' directory exists

  const response = await axios({
    method: "get",
    url: url,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(imagePath);

  response.data.pipe(writer);

   return new Promise((resolve, reject) => {
     writer.on("finish", () => resolve(imagePath));
     writer.on("error", reject);
   });
}

let url =
  "https://oaidalleapiprodscus.blob.core.windows.net/private/org-U42vkylfiAFzAGttNP02nX4f/user-kPZOChAAVO0OctrF4jp22tyl/img-zr0isxzigBU1npkrLsuusmqG.png?st=2023-12-28T11%3A44%3A53Z&se=2023-12-28T13%3A44%3A53Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-12-27T23%3A36%3A23Z&ske=2023-12-28T23%3A36%3A23Z&sks=b&skv=2021-08-06&sig=on6hnHg04F10zx/4AWTR7/RxcssCXyA/8qOCDjSfjkY%3D";

await downloadImage(url, "download.jpg")
  .then((imagePath) => {
    console.log(`Image downloaded at: ${imagePath}`);
  })
  .catch((error) => {
    console.error("Error downloading the image:", error);
  });
