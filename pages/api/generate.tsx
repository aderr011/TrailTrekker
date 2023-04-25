
import axios from 'axios';

// Set up the API credentials and parameters
const apiKey = process.env.OPENAI_API_KEY;
// const prompt = `Provide off-road trails with dispersed camping locations given the coordinates:

// In the form:

// name:
// lat:
// lng:
// desc:`;
const model = 'text-davinci-003';
const maxTokens: number = 200;
const apiUrl = 'https://api.openai.com/v1/completions';

// Set up the request body
type requestBodyType = {
  prompt: string,
  temperature: number,
  maxTokens: number,
  n: number,
  model: string,
  apiKey: string | undefined
};

export default async function sendRequest(latLng: google.maps.LatLngLiteral): Promise<string> {
  const coordinates:string = "(" + latLng.lat + ", " + latLng.lng + ")";
  const prompt = `Provide off-road trails with dispersed camping locations given the coordinates: ${coordinates}

      In the form:

      name:
      lat:
      lng:
      desc:`;

  const url = `${apiUrl}engines/${model}/completions`;
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
  const data = { prompt: prompt, max_tokens: maxTokens };
  const response = await axios.post(url, data, { headers: headers });
  return response.data.choices[0].text;
}

// // Send the API request
// axios.post(apiUrl, requestBody)
//   .then((response) => {
//     // Handle the response from the API
//     console.log(response.data.choices[0].text);
//   })
//   .catch((error) => {
//     console.log(error);
//   });

// const openai = new OpenAIApi(configuration);

// export default async function (req: any, res: Response) {
//   if (!configuration.apiKey) {
//     res.status(500).json({
//       error: {
//         message: "OpenAI API key not configured, please follow instructions in README.md",
//       }
//     });
//     return;
//   }

//   const coordinates = req.body.coordinates || '';
//   if (coordinates.trim().length === 0) {
//     res.status(400).json({
//       error: {
//         message: "Please enter valid coordinates",
//       }
//     });
//     return;
//   }

//   try {
//     const completion = await openai.createCompletion({
//       model: "text-davinci-003",
//       prompt: generatePrompt(animal),
//       temperature: 0.6,
//     });
//     res.status(200).json({ result: completion.data.choices[0].text });
//   } catch(error) {
//     // Consider adjusting the error handling logic for your use case
//     if (error.response) {
//       console.error(error.response.status, error.response.data);
//       res.status(error.response.status).json(error.response.data);
//     } else {
//       console.error(`Error with OpenAI API request: ${error.message}`);
//       res.status(500).json({
//         error: {
//           message: 'An error occurred during your request.',
//         }
//       });
//     }
//   }
// }

// function generatePrompt(coordinates: google.maps.LatLngLiteral) {
//   const coordinates =
//     animal[0].toUpperCase() + animal.slice(1).toLowerCase();
//   return `Suggest offroading trails with dispersed camping spaces on the trail given the coordinates: ${capitalizedAnimal}

// coordinates: Cat
// Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
// Animal: Dog
// Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
// Animal: ${capitalizedAnimal}
// Names:`;
// }
