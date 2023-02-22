const selectImage = document.querySelector('.select-image');
const inputFile = document.querySelector('#file');
const imgArea = document.querySelector('.img-area');
const predictionResult = document.querySelector('.prediction-result');
const probabilityElement = document.querySelector('.probability');
const predictedTagElement = document.querySelector('.predicted-tag');
const form = document.querySelector('form');


selectImage.addEventListener('click', function () {
    inputFile.click();
})

inputFile.addEventListener('change', function () {
    const image = this.files[0]
    if (image.size < 2000000) {
        const reader = new FileReader();
        reader.onload = () => {
            const allImg = imgArea.querySelectorAll('img');
            allImg.forEach(item => item.remove());
            const imgUrl = reader.result;
            const img = document.createElement('img');
            img.src = imgUrl;
            imgArea.appendChild(img);
            imgArea.classList.add('active');
            imgArea.dataset.img = image.name;

            // Make prediction request to Custom Vision API
            predictLogo(imgUrl);
        }
        reader.readAsDataURL(image);
    } else {
        alert("Image size more than 2MB");
    }
})

function predictFromUrl(url) {
  // Define API endpoint and parameters
  const endpoint = "https://northeurope.api.cognitive.microsoft.com/";
  const predictionKey = "45c378f92ece4577a2137e212b477fab";
  const projectId = "4380d3a8-4609-45ae-ba53-7c5c5041d652";
  const iterationId = "Iteration8";

  // Define request headers
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Prediction-Key", predictionKey);

  // Define request body
  const body = JSON.stringify({ url: url });

  // Send prediction request to API
  fetch(
    endpoint +
      "customvision/v3.0/Prediction/" +
      projectId +
      "/detect/iterations/" +
      iterationId +
      "/url",
    {
      method: "POST",
      headers: headers,
      body: body,
    }
  )
    .then((response) => response.json())
    .then((data) => {
      // Sort predictions by probability in descending order
      const sortedPredictions = data.predictions.sort(
        (a, b) => b.probability - a.probability
      );
      // Display prediction with highest probability
      const highestPrediction = sortedPredictions[0];
      predictionResult.style.display = "block";
      probabilityElement.textContent =
        Math.round(highestPrediction.probability * 100 * 100) / 100 + "%";
      predictedTagElement.textContent = highestPrediction.tagName;
    })
    .catch((error) => console.log(error));
}




form.addEventListener('submit', event => {
  event.preventDefault();
  const url = document.querySelector('#url-input').value;
  predictFromUrl(url);
});


function predictLogo(imgUrl) {
    // Define API endpoint and parameters
    const endpoint = "https://northeurope.api.cognitive.microsoft.com/";
    const predictionKey = "45c378f92ece4577a2137e212b477fab";
    const projectId = "4380d3a8-4609-45ae-ba53-7c5c5041d652";
    const iterationId = "Iteration8";
  
    // Define request headers
    const headers = new Headers();
    headers.append("Content-Type", "application/octet-stream");
    headers.append("Prediction-Key", predictionKey);
  
    // Convert image to binary data
    const binaryImg = atob(imgUrl.split(",")[1]);
    const arrayImg = new Uint8Array(binaryImg.length);
    for (let i = 0; i < binaryImg.length; i++) {
      arrayImg[i] = binaryImg.charCodeAt(i);
    }
  
    // Send prediction request to API
    fetch(
      endpoint +
        "customvision/v3.0/Prediction/" +
        projectId +
        "/detect/iterations/" +
        iterationId +
        "/image",
      {
        method: "POST",
        headers: headers,
        body: arrayImg,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // Sort predictions by probability in descending order
        const sortedPredictions = data.predictions.sort(
          (a, b) => b.probability - a.probability
        );
        // Display prediction with highest probability
        const highestPrediction = sortedPredictions[0];
        predictionResult.style.display = "block";
        probabilityElement.textContent =
          Math.round(highestPrediction.probability * 100 * 100) / 100 + "%";
        predictedTagElement.textContent = highestPrediction.tagName;
      })
      .catch((error) => console.log(error));
  }
  