const mongoose = require("mongoose")

module.exports = [{
  _id: mongoose.Types.ObjectId("647d84f11258181df991c6e3"),
  geoId: "60650408211",
  name: "Indoor Stadium,Howrah",
  geographicLevel: "MSA",
  state: 4,
  county: 440,
  tract: 440443100,
  blockGroup: 4404431001,
  centroid: {
    type: "Point",
    coordinates: [
      88.30677391559988,
      22.58170767865049
    ]
  },
  censusAttributes: {
    B01003_E001: 843,
    B01003_M001: 467
  },
  censusBlocks: {}
},
{
  _id: mongoose.Types.ObjectId("64955b085f8e97687703fe66"),
  geoId: "60650408319",
  name: "Inside Indoor stadium with geolevel Blocks,Howrah",
  geographicLevel: "Blocks",
  state: 5,
  county: 550,
  tract: 550553100,
  blockGroup: 5505531001,
  centroid: {
    type: "Point",
    coordinates: [
      88.30663937257168,
      22.581467479761614
    ]
  },
  censusAttributes: {
    B01003_E002: 842,
    B01003_M002: 462
  },
  censusBlocks: {}
}]
// {
//   _id: mongoose.Types.ObjectId("647d84f31258181df991c6e4"),
//   _censusData: {
//     geoId: 60650408212,
//     name: "Park inside stadium corridor,Howrah",
//     geographicLevel: "MSA",
//     state: 4,
//     county: 440,
//     tract: 440443100,
//     blockGroup: 4404431002,
//     latitude: 88.3071118783298,
//     longitude: 22.58044283651057,
//     censusAttributes: {}
//   }
// },
// {
//   _id: mongoose.Types.ObjectId("647d97cf1258181df991c6e6"),
//   _censusData: {
//     geoId: 60650408213,
//     name: "Kasundia Playground,Howrah",
//     geographicLevel: "MSA",
//     state: 4,
//     county: 440,
//     tract: 440443100,
//     blockGroup: 4404431003,
//     latitude: 88.31095343240031,
//     longitude: 22.58261661112489,
//     censusAttributes: {}
//   }
// },
// {
//   _id: mongoose.Types.ObjectId("647da6d31258181df991c6e9"),
//   _censusData: {
//     geoId: 60650408214,
//     name: "Extended Stadium outside main corridor,Howrah",
//     geographicLevel: "MSA",
//     state: 4,
//     county: 440,
//     tract: 440443100,
//     blockGroup: 4404431004,
//     latitude: 88.30739400125555,
//     longitude: 22.5821194174718,
//     censusAttributes: {}
//   }
// },
// {
//   _id: mongoose.Types.ObjectId("647da6d51258181df991c6ea"),
//   _censusData: {
//     geoId: 60650408215,
//     name: "Stadium swimming pool,Howrah",
//     geographicLevel: "MSA",
//     state: 4,
//     county: 440,
//     tract: 440443100,
//     blockGroup: 4404431005,
//     latitude: 88.30759692308277,
//     longitude: 22.581350577538117,
//     censusAttributes: {}
//   }
// }
