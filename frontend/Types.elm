module Types exposing (..)

import Dict
import Http


type Page
    = Home
    | About
    | Favorites
    | Route Int
    | Search String


type Msg
    = UpdateSearchText String
    | DoSearch
    | SearchSuccess (List SearchStopp)
    | SearchFailed Http.Error
    | LoadStopSuccess RuterStoppApi
    | LoadStopFailed Http.Error


type alias SearchStopp =
    { id : Int
    , name : String
    , district : String
    }


type alias MonitoredVehicleJourney =
    { destinationName : String
    , publishedLineName : String
    }


type alias RuterAvgang =
    { monitoringRef : String
    , monitoredVehicleJourney : MonitoredVehicleJourney
    }

type alias Position =
    { longitude : Float
    , latitude : Float
    }


-- Shape of our app's data
type alias RuterStopp =
    { id : Int
    , name : String
    , district : String
    , placeType : String
    , zone : String
    , avganger : List RuterAvgang
    , position : Position
    }


-- Shape of response from API
type alias RuterStoppApi =
    { id : Int
    , name : String
    , district : String
    , placeType : String
    , x : Float
    , y : Float
    , zone : String
    , avganger : List RuterAvgang
    }
