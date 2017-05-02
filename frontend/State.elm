module State exposing (..)

import Dict
import Navigation
import Types exposing (..)
import Pages exposing (..)
import Api exposing (..)

type alias Model =
    { page : Page
    , search : String
    , results : List SearchStopp
    , isLoading : Bool
    , stops : Dict.Dict Int RuterStopp
    , error : String
    }

init : Navigation.Location -> ( Model, Cmd Msg )
init location =
    let 
        page = hashParser location
    in
        case page of
            Just aPage ->
                ( (Model aPage "" [] False Dict.empty ""), Cmd.none )

            Nothing ->
                ( (Model Home "" [] False Dict.empty ""), Cmd.none )



logUpdates : ( Msg -> Model -> ( Model, Cmd msg )) ->  Msg -> Model -> ( Model, Cmd msg )
logUpdates updateFunc msg model =
    let 
        ( nextModel, nextCmd ) = updateFunc msg model
        one = Debug.log "PrevState" (model)
        two = Debug.log "NextState" (nextModel)
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
                maybePage = hashParser location
            in
                case maybePage of
                    Just aPage ->
                        case aPage of
                            About ->
                                ( { model | page = aPage }, Cmd.none)

                            Favorites ->
                                ( { model | page = aPage }, Cmd.none)

                            Home ->
                                ( { model | page = aPage }, Cmd.none)

                            Route id ->
                                ( { model | page = aPage, isLoading = True }, loadStopId id)

                            Search query ->
                                ( { model | page = aPage, search = query, isLoading = True }, searchStop query)

                    Nothing ->
                        ( { model | page = Home }, Cmd.none)

        UpdateSearchText text ->
            ( { model | search = text }, Cmd.none )

        LoadStopResult result ->
            let
                res = Result.map toRuterStopp result
            in
                case res of
                    Ok aStop ->
                            ( { model | stops = (Dict.insert aStop.id aStop model.stops), isLoading = False }, Cmd.none )
                    Err err ->
                        let
                            err2 = Debug.log "LoadStopFailed" err
                        in
                            ( { model | error = (toString err), isLoading = False }, Cmd.none )

        DoSearch ->
            let
                nextPage = (Search model.search)
            in
                ( { model | page = nextPage, isLoading = True }, (Navigation.newUrl (toHash nextPage)) )

        SearchResult result ->
            case result of
                Ok data ->
                    ( { model | results = data, isLoading = False }, Cmd.none )
                
                Err err ->
                    let
                       err2 = Debug.log "SearchFailed" err
                    in
                        ( { model | error = (toString err), isLoading = False }, Cmd.none )


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
            ( { model | page = page, search = "" } , Cmd.none )
