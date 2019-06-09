module State exposing (..)

import Dict
import Navigation
import Types exposing (..)
import Pages exposing (..)
import Api exposing (..)


init : Result String Page -> ( Model, Cmd Msg )
init result =
    urlUpdate result (Model Home "" [] Dict.empty "")


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        UpdateSearchText text ->
            ( { model | search = text }, Cmd.none )

        LoadStopFailed err ->
            logError ("LoadStopFailed: " ++ (toString err))
                ( { model | error = (toString err) }, Cmd.none )

        LoadStopSuccess aStop ->
            ( { model | stops = (Dict.insert aStop.id aStop model.stops) }, Cmd.none )

        DoSearch ->
            -- ( model, searchStop model.search )
            let
                newPage =
                    Search model.search
            in
                ( { model | page = newPage }, (Navigation.newUrl (toHash newPage)) )

        SearchSuccess data ->
            ( { model | results = data }, Cmd.none )

        SearchFailed err ->
            logError ("SearchFailed: " ++ (toString err))
                ( { model | error = (toString err) }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


logError a =
    Debug.log (toString a)


{-| The URL is turned into a result. If the URL is valid, we just update our
model to the new count. If it is not a valid URL, we modify the URL to make
sense.
-}
urlUpdate : Result String Page -> Model -> ( Model, Cmd Msg )
urlUpdate result model =
    case Debug.log "urlUpdate: result=" result of
        Err _ ->
            -- {-| on err, we go back to where we were -}
            ( model, Navigation.modifyUrl (toHash model.page) )

        Ok ((Search query) as page) ->
            ( { model | page = page, search = query }, searchStop model.search )

        Ok ((Route id) as page) ->
            ( { model | page = page }, loadStopId id )

        -- ! if Dict.member query model.cache then [] else [ get query ]
        Ok page ->
            { model | page = page, search = "" }
                ! []
