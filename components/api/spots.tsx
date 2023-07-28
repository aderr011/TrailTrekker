import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import { Place } from "@/constants";
import {useEffect} from "react";
import {
  Marker,
  MarkerClusterer,
} from "@react-google-maps/api";

// const configuration = new Configuration({
//   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
// });
// const myOpenai = new OpenAIApi(configuration);

type SpotsProps = {
  searchTrailsLoc : (google.maps.LatLngLiteral | undefined);
  setTrailResults : (places: Place[]) => void;
  trailResults : (Place[]);
};

export default function Spots({searchTrailsLoc, setTrailResults, trailResults}: SpotsProps) {
//   async function askGPT(searchLoc: Place) {
//     if (!searchLoc) return;
//     if (!configuration.apiKey) throw new Error("OpenAI API key not configured, please follow instructions in README.md");
  
//     const coordinates = "(" + searchLoc.lat + ", " + searchLoc.lng + ")";
//     const address = searchLoc.name;
//     console.log("Coordinate: " + coordinates + "\nAddress: " + address);
//     if (coordinates.trim().length === 0) throw new Error("Please enter a valid set of coordinates");
  
//     const chatGptMessages = [
//       {
//         role: ChatCompletionRequestMessageRoleEnum.System,
//         content: "You are a helpful assistant who returns a list of Motor Vehicle Use trails within 30 miles of a given a coordinate and/or coordinate",
//       },
//       {
//         role: ChatCompletionRequestMessageRoleEnum.User,
//         content: `Coordinate: (40.69948501341462, -105.5812484182215)`,
//       },
//       {
//         role: ChatCompletionRequestMessageRoleEnum.Assistant,
//         content: `name:Kelly Flats Road
// lat:40.682875
// lng:-105.482818
  
// name:Old Flowers Road
// lat:40.619240
// lng:-105.357196
  
// name:Deadman Road
// lat:40.792491 
// lng:-105.603987
  
// name:Roaring Creek Road
// lat40.805946 
// lng:-105.772568
  
// name:Swamp Creek Road
// lat:40.751547
// lng:-105.616751
  
// name:Crown Point Road
// lat:40.654853
// lng:-105.526077
  
// name:Bald Mountain
// lat:40.762935 
// lng:-105.612523`,
//       },
//       {
//         role: ChatCompletionRequestMessageRoleEnum.User,
//         content: "Coordinate: " + coordinates,
//       },
//     ]
  
//     try {
//       console.log("Sending request")
//       const response = await myOpenai.createChatCompletion({
//         messages: chatGptMessages,
//         model: 'gpt-3.5-turbo',
//       });
  
//       let placesList: Place[] = [];
//       console.log(response.data.choices[0].message?.content);
//       const lines: string[] | undefined = response.data.choices[0].message?.content.split('\n\n');
//       if (!lines || lines.length < 2) return;
//       console.log(lines);
  
//        const places: string[] = lines.filter(function(line) {
//         if (!line.startsWith("name")) return false;
//         return true;
//       })
//       console.log("The Lines: ")
//       console.log(places);

//       placesList = places.map((placeString) => {
//         const lines = placeString.trim().split("\n");
//         var name: string = (lines[0]) ? lines[0].split(":")[1].trim(): "";
//         var lat: number = (lines[1]) ? parseFloat(lines[1].split(":")[1].trim()): 0;
//         var lng: number = (lines[2]) ? parseFloat(lines[2].split(":")[1].trim()): 0;
//         return { name, lat, lng };
//       });
//       console.log("The Places List:")
//       console.log(placesList);
//       setTrailResults(placesList);
//     } catch(error: any) {
//       if (error.response) {
//         console.error(error.response.status, error.response.data);
//       } else {
//         console.error(`Error with OpenAI API request: ${error.message}`);
//       }
//     }
//   }

//   //Whenever the searchTrailsLoc changes we call chatGPT 
//   useEffect(() => {
//     if (!searchTrailsLoc?.lat || !searchTrailsLoc?.lng) return;
//     var myPlace: Place = {name:"", lat:searchTrailsLoc?.lat, lng:searchTrailsLoc?.lng};
//     askGPT(myPlace);
//   }, [searchTrailsLoc]);

//   return (
//     <MarkerClusterer>
//       {(clusterer) =>
//         trailResults.map((trail) => (
//           <Marker
//             key={trail.lat}
//             position={trail}
//             clusterer={clusterer}
//             label={trail.name}
//             // onClick={() => {
//             //   fetchDirections(trail);
//             // }}
//           />
//         ))
//       }
//     </MarkerClusterer>
//   ); 
}

  const preprevPropmt=`name:Kelly Flats Road
  desc:This trail is located approximately 7 miles northwest of the coordinates you provided and offers a moderate difficulty rating. The trail is 7 miles long and offers dispersed camping opportunities nearby.

  name:Old Flowers Road
  desc:Old Flowers Road is a mountain passage that travels from the Stove Prairie community westward to an area known as Pingree Park. It meanders through a section of the Roosevelt National Forest, known by locals as High Park, with a long history of mountain ranching.
    
  name:Green Ridge Trail
  desc:Green Ridge Trail is a very fun and adventurous trail that travels north along the Green Ridge from Poudre Canyon to the Deadman vicinity near Red Feather Lakes, Colorado. The trail has numerous water crossings with some of them exceeding 36" in depth. 

  name:Deadman Road
  desc:Deadman Road is an easy off-road trail through the Roosevelt National Forest with seemingly endless forest access and different routes to explore. Traveling from Red Feather Lakes to the Medicine Bow National Forest, Deadman Road was established for logging which it is still used for to this day. The logging history is also where this road gets its name, doesn't actually have anything to do with a dead man. Luckily, this has allowed for hundreds of miles OHV and 4x4 roads to be created.

  name:Roaring Creek Road
  desc:Roaring Creek Road is the 4X4 road that ties together the more difficult trails in the Deadman and Bald Mountain areas of the Roosevelt National Forest. A well improved two-vehicle wide gravel road awaits you for the first three miles of Roaring Creek Road. In the last two miles, the road becomes more narrow with few places for vehicles to pass.

  name:Swamp Creek Road
  desc:Swamp Creek offers some excellent opportunities to test your 4X4 through heavy and drifting snow. Popular with campers during the summer months, excellent dispersed camping with views of the mountains and the Poudre River Canyon makes this a great weekend destination. The ghost town of Manhattan, Colorado is located just south of the Swamp Creek Road trailhead.

  name:Crown Point Road
  desc:Crown Point Road is a scenic 4x4 trail that offers stunning views of Horsetooth Reservoir and the surrounding mountains. There are several dispersed camping sites along the trail, but be aware that the trail can be narrow and steep in some sections.
    
  name:Bald Mountain
  desc:Creedmore Bald Mountain is a 4WD trail located in the Roosevelt National Forest a few miles southwest of Red Feather Lakes, CO. The trail winds through the dense Lodge-pole Pine forest as it climbs to nearly 11,000 feet. The trail offers a variety of experiences as you head west on the 13 mile journey. It is known for its rocky mid-section and then its muddy path near the trail's end. This route is true 4WD experience to escape the summer heat as it remains in the trees.`
  const prevPrompt=`name:Kelly Flats Road
  startLat:40.682875
  startLng:-105.482818
  endLat:40.725702, 
  endLng:-105.582933
  desc:Kelly Flats Road is a challenging 10-mile off-road trail in the Roosevelt National Forest near Fort Collins. It's rocky and steep, with dispersed camping sites available along the way. Experienced off-roaders and outdoor enthusiasts will enjoy the beautiful views of the surrounding mountains and forests.
  
  name:Swamp Creek Road
  startLat:40.751547
  startLng:-105.616751
  endLat:40.732202
  endLng:-105.599442
  desc:Swamp Creek Road is a challenging 9-mile off-road trail in the Roosevelt National Forest near Fort Collins. It's rocky and steep, with a few dispersed camping sites along the way. Exercise caution and check for restrictions before visiting. Experienced off-roaders and outdoor enthusiasts will enjoy the beautiful views and wildlife opportunities.

  name:Crown Point Road
  startLat:40.654853
  startLng:-105.526077
  endLat:40.609822
  endLng:-105.756716
  desc:Crown Point Road is a moderate 4x4 trail located in the Roosevelt National Forest near Fort Collins. The 6-mile trail offers beautiful views of the surrounding mountains and forests, with a few dispersed camping sites available.
  
  name:Bald Mountain
  startLat:40.762935 
  startLng:-105.612523
  endLat: 40.777792
  endLng:-105.814078
  desc:Bald Mountain is a moderate off-road trail located in the Roosevelt National Forest near Red Feather Lakes. The 6-mile trail offers scenic views and a few dispersed camping sites along the way.`

  




