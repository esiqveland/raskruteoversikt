module State exposing (..)

import Navigation
import Dict exposing (Dict)
import Json.Decode as Json exposing (field)
import Types exposing (..)
import Pages exposing (..)
import Api exposing (..)


type alias Model =
    { page : Page
    , search : String
    , favorites : Dict Int Favorite
    , results : Maybe (List SearchStopp)
    , isLoading : Bool
    , stops : Dict Int RuterStopp
    , error : String
    }


type alias InitFlags =
    { favorites : Dict String Favorite }


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


initFlagsDecoder : Json.Decoder InitFlags
initFlagsDecoder =
    Json.map InitFlags
        (field "favorites" favoritesDecoder)



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


isInt : ( String, val ) -> Bool
isInt keyVal =
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
        |> List.filter isInt
        |> List.map toIntVal
        |> Dict.fromList


init : String -> Navigation.Location -> ( Model, Cmd Msg )
init str location =
    let
        flags =
            case Json.decodeString initFlagsDecoder str of
                Ok parsedFlags ->
                    parsedFlags

                _ ->
                    InitFlags Dict.empty

        favs =
            convertFavorites flags.favorites

        page =
            case hashParser location of
                Just aPage ->
                    aPage

                Nothing ->
                    Home
    in
        ( (Model page "" favs Maybe.Nothing False Dict.empty ""), (Navigation.newUrl (toHash page)) )


logUpdates : (Msg -> Model -> ( Model, Cmd msg )) -> Msg -> Model -> ( Model, Cmd msg )
logUpdates updateFunc msg model =
    let
        ( nextModel, nextCmd ) =
            updateFunc msg model

        one =
            Debug.log "PrevState" (model)

        two =
            Debug.log "NextState" (nextModel)
    in
        ( nextModel, nextCmd )


updateLogger : Msg -> Model -> ( Model, Cmd Msg )
updateLogger msg model =
    logUpdates update msg model


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UrlChange location ->
            let
                page =
                    case hashParser location of
                        Just aPage ->
                            aPage

                        Nothing ->
                            Home
            in
                case page of
                    About ->
                        ( { model | page = page }, Cmd.none )

                    Favorites ->
                        ( { model | page = page }, Cmd.none )

                    Home ->
                        ( { model | page = page }, Cmd.none )

                    Route id ->
                        ( { model | page = page, isLoading = True }, loadStopId id )

                    Search query ->
                        ( { model | page = page, search = query, isLoading = True }, searchStop query )

        UpdateSearchText text ->
            ( { model | search = text }, Cmd.none )

        LoadStopResult result ->
            let
                res =
                    Result.map toRuterStopp result
            in
                case res of
                    Ok aStop ->
                        ( { model | stops = (Dict.insert aStop.id aStop model.stops), isLoading = False }, Cmd.none )

                    Err err ->
                        let
                            err2 =
                                Debug.log "LoadStopFailed" err
                        in
                            ( { model | error = (toString err), isLoading = False }, Cmd.none )

        DoSearch ->
            let
                nextPage =
                    (Search model.search)
            in
                ( { model | page = nextPage, isLoading = True }, (Navigation.newUrl (toHash nextPage)) )

        SearchResult result ->
            case result of
                Ok data ->
                    ( { model | results = Maybe.Just data, isLoading = False }, Cmd.none )

                Err err ->
                    let
                        err2 =
                            Debug.log "SearchFailed" err
                    in
                        ( { model | error = (toString err), isLoading = False }, Cmd.none )

        ToggleFavorite aStop ->
            ( { model | favorites = (toggleFavorite model.favorites aStop) }, Cmd.none )


toggleFavorite : Dict Int Favorite -> RuterStopp -> Dict Int Favorite
toggleFavorite favs aStop =
    let
        newFav =
            Favorite aStop.id aStop.name aStop.position
    in
        case Dict.get aStop.id favs of
            Just a ->
                Dict.filter (\id -> \val -> id /= aStop.id) favs

            Nothing ->
                Dict.insert aStop.id newFav favs


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


{-| The URL is turned into a result. If the URL is valid, we just update our
model to the new count. If it is not a valid URL, we modify the URL to make
sense.
-}
urlUpdate : Result String Page -> Model -> ( Model, Cmd Msg )
urlUpdate result model =
    case Debug.log "urlUpdate: result=" result of
        Err _ ->
            ( model, Navigation.modifyUrl (toHash model.page) )

        -- {-| on err, we go back to where we were -}
        Ok ((Search query) as page) ->
            ( { model | page = page, search = query }, searchStop model.search )

        Ok ((Route id) as page) ->
            ( { model | page = page, isLoading = True }, loadStopId id )

        -- ! if Dict.member query model.cache then [] else [ get query ]
        Ok page ->
            ( { model | page = page, search = "" }, Cmd.none )
