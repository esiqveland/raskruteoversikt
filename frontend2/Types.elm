module Types exposing (..)

import Dict
import Http


type alias Model =
    { page : Page
    , search : String
    , results : List SearchStopp
    , stops : Dict.Dict Int RuterStopp
    , error : String
    }


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
    | LoadStopSuccess RuterStopp
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


type alias RuterStopp =
    { id : Int
    , name : String
    , district : String
    , placeType : String
    , zone : String
    , avganger : List RuterAvgang
    , position : Position
    }

