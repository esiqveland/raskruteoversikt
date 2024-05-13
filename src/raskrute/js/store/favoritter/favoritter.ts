import * as z from "zod";

export const LocationSchema = z.object({
    "latitude": z.number(),
    "longitude": z.number(),
});
export type FavorittLocation = z.infer<typeof LocationSchema>;

export const StopPlaceSchema = z.object({
    "name": z.string(),
    "ID": z.string(),
    "location": LocationSchema.optional(),
});
export type StopPlace = z.infer<typeof StopPlaceSchema>;

export const FavorittStoreStaticSchema = z.object({
    "last_saved": z.string().datetime(),
})

export const StopStoreSchema = z.record(StopPlaceSchema)

// export const FavorittStoreSchema = z.intersection(
//     FavorittStoreStaticSchema,
//     z.record(StopPlaceSchema).optional(),
// )
export const FavorittStoreSchema = z.object({
    "last_saved": z.string().datetime(),
    "stops": StopStoreSchema,
})
export type FavorittStoreType = z.infer<typeof FavorittStoreSchema>;

// export const WelcomeSchema = z.object({
//     "last_saved": z.coerce.date(),
//
//     "NSR:StopPlace:4029": StopPlaceSchema,
//     "NSR:StopPlace:58189": StopPlaceSchema,
//     "NSR:StopPlace:58211": StopPlaceSchema,
//     "NSR:StopPlace:58163": StopPlaceSchema,
// });
// export type Welcome = z.infer<typeof WelcomeSchema>;

const StoreSampleJson = `{
  "last_saved": "2024-03-18T16:55:11.107Z",
  "NSR:StopPlace:4029": {
    "name": "Stortinget",
    "ID": "NSR:StopPlace:4029",
    "location": {
      "latitude": 59.913437,
      "longitude": 10.743256
    }
  },
  "NSR:StopPlace:58189": {
    "name": "Carl Berners plass",
    "ID": "NSR:StopPlace:58189",
    "location": {
      "latitude": 59.926144,
      "longitude": 10.7763
    }
  },
  "NSR:StopPlace:58211": {
    "name": "Oslo lufthavn",
    "ID": "NSR:StopPlace:58211",
    "location": {
      "latitude": 60.193361,
      "longitude": 11.097887
    }
  }
}`

const StoreSampleJson2 = `{
  "last_saved": "2024-03-18T16:55:11.107Z",
  "stops": {
      "NSR:StopPlace:4029": {
        "name": "Stortinget",
        "ID": "NSR:StopPlace:4029",
        "location": {
          "latitude": 59.913437,
          "longitude": 10.743256
        }
      },
      "NSR:StopPlace:58189": {
        "name": "Carl Berners plass",
        "ID": "NSR:StopPlace:58189",
        "location": {
          "latitude": 59.926144,
          "longitude": 10.7763
        }
      },
      "NSR:StopPlace:58211": {
        "name": "Oslo lufthavn",
        "ID": "NSR:StopPlace:58211",
        "location": {
          "latitude": 60.193361,
          "longitude": 11.097887
        }
      }
  }
}`

// assertion we support the schema we think we support:
const testParse = FavorittStoreSchema.parse(JSON.parse(StoreSampleJson2))
