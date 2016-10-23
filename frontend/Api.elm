module Api exposing (..)

import Task
import Http
import Json.Decode as Json exposing ((:=))
import Types exposing (..)


loadStopId : Int -> Cmd Msg
loadStopId id =
    let
        url =
            "http://localhost:9999/api/routes/" ++ (toString id)
    in
        Task.perform LoadStopFailed LoadStopSuccess  (Http.get ruterStoppApiDecoder url)

monitoredVehicleJourneyDecoder : Json.Decoder MonitoredVehicleJourney
monitoredVehicleJourneyDecoder =
    Json.object2 MonitoredVehicleJourney
        ("DestinationName" := Json.string)
        ("PublishedLineName" := Json.string)

ruterAvgangDecoder : Json.Decoder RuterAvgang
ruterAvgangDecoder =
    Json.object2 RuterAvgang
        ("MonitoringRef" := Json.string)
        ("MonitoredVehicleJourney" := monitoredVehicleJourneyDecoder)


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


toRuterStopp : RuterStoppApi -> RuterStopp
toRuterStopp stopp =
    RuterStopp stopp.id stopp.name stopp.district stopp.placeType stopp.zone stopp.avganger (Position stopp.x stopp.y)


ruterStoppApiDecoder : Json.Decoder RuterStoppApi
ruterStoppApiDecoder =
     Json.object8 RuterStoppApi
        ("ID" := Json.int)
        ("Name" := Json.oneOf [ Json.string, Json.null "" ])
        ("District" := Json.oneOf [ Json.string, Json.null "" ])
        ("PlaceType" := Json.oneOf [ Json.string, Json.null "" ])
        ("X" := Json.oneOf [ Json.float, Json.null 0 ])
        ("Y" := Json.oneOf [ Json.float, Json.null 0 ])
        ("Zone" := Json.oneOf [ Json.string, Json.null "" ])
        ("avganger" := Json.list ruterAvgangDecoder)



searchStop : String -> Cmd Msg
searchStop searchStr =
    let
        url =
            "http://localhost:9999/api/search/" ++ searchStr
    in
        Task.perform SearchFailed SearchSuccess (Http.get decodeRuteSearch url)


searchStoppDecoder : Json.Decoder SearchStopp
searchStoppDecoder =
    Json.object3 SearchStopp
        ("ID" := Json.int)
        ("Name" := Json.oneOf [ Json.string, Json.null "" ])
        ("District" := Json.oneOf [ Json.string, Json.null "" ])


decodeRuteSearch : Json.Decoder (List SearchStopp)
decodeRuteSearch =
    Json.list searchStoppDecoder
