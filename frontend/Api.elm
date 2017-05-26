module Api exposing (..)

import Task
import Http
import Json.Decode as Json exposing (field)
import Types exposing (..)


loadStopId : Int -> Cmd Msg
loadStopId id =
    let
        url =
            "http://localhost:9999/api/routes/" ++ (toString id)
    in
        Task.attempt LoadStopResult (Http.toTask (Http.get url ruterStoppApiDecoder))


monitoredVehicleJourneyDecoder : Json.Decoder MonitoredVehicleJourney
monitoredVehicleJourneyDecoder =
    Json.map2 MonitoredVehicleJourney
        (field "DestinationName" Json.string)
        (field "PublishedLineName" Json.string)

ruterAvgangDecoder : Json.Decoder RuterAvgang
ruterAvgangDecoder =
    Json.map2 RuterAvgang
        (field "MonitoringRef" Json.string)
        (field "MonitoredVehicleJourney" monitoredVehicleJourneyDecoder)


toRuterStopp : RuterStoppApi -> RuterStopp
toRuterStopp stopp =
    let
        xAndy = (stopp.x, stopp.y)
        pos = case xAndy of
            (Just x, Just y) -> Just (Position x y)
            (_, _)           -> Nothing
    in
        RuterStopp stopp.id stopp.name stopp.district stopp.placeType stopp.zone stopp.avganger pos

positionDecoder : Json.Decoder Position
positionDecoder =
    Json.map2 Position
        (field "X" Json.float)
        (field "Y" Json.float)

ruterStoppApiDecoder : Json.Decoder RuterStoppApi
ruterStoppApiDecoder =
     Json.map8 RuterStoppApi
        (field "ID" Json.int)
        (field "Name" (Json.oneOf [ Json.string, Json.null "" ]))
        (field "District" (Json.oneOf [ Json.string, Json.null "" ]))
        (field "PlaceType" (Json.oneOf [ Json.string, Json.null "" ]))
        (field "Zone" (Json.oneOf [ Json.string, Json.null "" ]))
        (field "avganger" (Json.list ruterAvgangDecoder))
        (field "X" (Json.maybe Json.float))
        (field "Y" (Json.maybe Json.float))



searchStop : String -> Cmd Msg
searchStop searchStr =
    let
        url =
            "http://localhost:9999/api/search/" ++ searchStr
    in
        Task.attempt SearchResult (Http.toTask (Http.get url decodeRuteSearch))


searchStoppDecoder : Json.Decoder SearchStopp
searchStoppDecoder = 
    Json.map3 SearchStopp
        (Json.at ["ID"] Json.int)
        (Json.at ["Name"] (Json.oneOf [ Json.string, Json.null "" ]))
        (Json.at ["District"] (Json.oneOf [ Json.string, Json.null "" ]))


decodeRuteSearch : Json.Decoder (List SearchStopp)
decodeRuteSearch =
    Json.list searchStoppDecoder
