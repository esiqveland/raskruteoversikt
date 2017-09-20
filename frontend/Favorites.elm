port module Favorites exposing (..)

import Types exposing (..)
import Dict exposing (Dict)
import Maybe
import Json.Decode as Json exposing (field)
import Json.Encode exposing (encode, Value, string, int, float, bool, list, object)


port storeFavorites : String -> Cmd msg


toJsonList : Dict Int Favorite -> List ( String, Value )
toJsonList favs =
    Dict.toList favs
        |> List.map (\( a, b ) -> ( toString a, favToValue b ))


defaultPos : Position
defaultPos =
    Position 0.0 0.0


favToValue : Favorite -> Value
favToValue fav =
    Json.Encode.object
        [ ( "id", int fav.id )
        , ( "name", string fav.name )
        , ( "location"
          , Json.Encode.object
                [ ( "longitude", float (Maybe.withDefault defaultPos fav.location).longitude )
                , ( "latitude", float (Maybe.withDefault defaultPos fav.location).latitude )
                ]
          )
        ]


stringify : Dict Int Favorite -> String
stringify favs =
    Json.Encode.object (toJsonList favs)
        |> Json.Encode.encode 1



-- TODO: Date
-- (field "last_updated" Json.string)


toIntVal : ( String, val ) -> ( Int, val )
toIntVal keyVal =
    case keyVal of
        ( str, val ) ->
            case String.toInt str of
                Ok intKey ->
                    ( intKey, val )

                Err _ ->
                    ( 0, val )


isIntKey : ( String, val ) -> Bool
isIntKey keyVal =
    case keyVal of
        ( str, val ) ->
            case String.toInt str of
                Ok v ->
                    True

                Err s ->
                    False


convertFavorites : Dict String Favorite -> Dict Int Favorite
convertFavorites favs =
    Dict.toList favs
        |> List.filter isIntKey
        |> List.map toIntVal
        |> Dict.fromList


positionDecoder : Json.Decoder Position
positionDecoder =
    Json.map2 Position
        (field "longitude" Json.float)
        (field "latitude" Json.float)


favoriteDecoder : Json.Decoder Favorite
favoriteDecoder =
    Json.map3 Favorite
        (field "id" Json.int)
        (field "name" Json.string)
        (field "location" (Json.maybe positionDecoder))


favoritesDecoder : Json.Decoder (Dict String Favorite)
favoritesDecoder =
    Json.dict favoriteDecoder
