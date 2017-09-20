module Types exposing (..)

import Dict exposing (Dict)
import List
import Http
import Navigation


type Page
    = Home
    | About
    | Favorites
    | Route Int
    | Search String

type alias Favorite =
    { id : Int
    , name : String
    , location : Maybe Position
    }




type Msg
    = UpdateSearchText String
    | UrlChange Navigation.Location
    | DoSearch
    | StoreFavorites
    | SearchResult (Result Http.Error (List SearchStopp))
    | LoadStopResult (Result Http.Error RuterStoppApi)
    | ToggleFavorite RuterStopp


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
    , position : Maybe Position
    }


type alias RuterStoppApi =
    { id : Int
    , name : String
    , district : String
    , placeType : String
    , zone : String
    , avganger : List RuterAvgang
    , x : Maybe Float
    , y : Maybe Float
    }
