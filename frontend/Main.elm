module Main exposing (..)

import Task
import Http
import Json.Decode as Json exposing ((:=))
import Html exposing (Html, form, button, div, text, nav, span, footer, input, ul, li)
import Html.App as App
import Html.Keyed as Keyed
import Html.Attributes exposing (class, id, value, type', placeholder)
import Html.Events exposing (onClick, onInput, onSubmit)


main : Program Never
main =
    App.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias RuterStopp =
    { id : Int
    , name : String
    , district : String
    }


type Msg
    = Increment
    | Decrement
    | UpdateSearchText String
    | DoSearch
    | SearchSuccess (List RuterStopp)
    | SearchFailed Http.Error


type alias Model =
    { count : Int
    , search : String
    , results : List RuterStopp
    }


init : ( Model, Cmd Msg )
init =
    ( Model 0 "" [], Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Increment ->
            ( { model | count = model.count + 1 }, Cmd.none )

        Decrement ->
            ( { model | count = model.count - 1 }, Cmd.none )

        UpdateSearchText text ->
            ( { model | search = text }, Cmd.none )

        DoSearch ->
            ( model, searchStop model.search )

        SearchSuccess data ->
            ( { model | results = data }, Cmd.none )

        SearchFailed err ->
            ( model, Cmd.none )


searchStop : String -> Cmd Msg
searchStop searchStr =
    let
        url =
            "http://localhost:9999/api/search/" ++ searchStr
    in
        Task.perform SearchFailed SearchSuccess (Http.get decodeRuteSearch url)


ruterStoppDecoder : Json.Decoder RuterStopp
ruterStoppDecoder =
    Json.object3 RuterStopp
        ("ID" := Json.int)
        ("Name" := Json.string)
        ("District" := Json.string)


decodeRuteSearch : Json.Decoder (List RuterStopp)
decodeRuteSearch =
    Json.list ruterStoppDecoder


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


header : a -> Html b
header _ =
    nav []
        [ span [] [ text "Home" ]
        ]


searchForm : Model -> Html Msg
searchForm model =
    form [ onSubmit DoSearch ]
        [ input
            [ type' "text"
            , placeholder "Jernbanetorget"
            , onInput UpdateSearchText
            , value model.search
            ]
            []
        , button [ onSubmit DoSearch, onClick DoSearch ] [ text "Search" ]
        ]


result : RuterStopp -> Html Msg
result stopp =
    li [] [ text stopp.name ]


searchResults : Model -> Html Msg
searchResults model =
    ul [ class "searchResults" ]
        (List.map result model.results)


app : Model -> Html Msg
app model =
    div []
        [ button [ onClick Decrement ] [ text "-" ]
        , div [] [ text (toString model.count) ]
        , button [ onClick Increment ] [ text "+" ]
        , div []
            [ searchForm model
            , searchResults model
            ]
        ]


foot : Model -> Html Msg
foot _ =
    footer []
        [ text "Footer"
        ]


view : Model -> Html Msg
view model =
    div [ id "main" ]
        [ header model
        , app model
        , foot model
        ]
