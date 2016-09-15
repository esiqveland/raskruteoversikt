module Main exposing (..)

import Task
import Http
import Navigation
import String
import Json.Decode as Json exposing ((:=))
import Html exposing (Html, header, a, form, table, tr, td, button, div, text, nav, span, footer, input, ul, li, h1, h4)
import Html.App as App
import Html.Keyed as Keyed
import Html.Attributes exposing (class, id, value, type', placeholder, href)
import Html.Events exposing (onClick, onInput, onSubmit)
import UrlParser exposing ((</>))


main : Program Never
main =
    Navigation.program (Navigation.makeParser hashParser)
        { init = init
        , view = view
        , update = update
        , urlUpdate = urlUpdate
        , subscriptions = subscriptions
        }


toHash : Page -> String
toHash page =
    case page of
        Home ->
            "#"

        About ->
            "#about"

        Favorites ->
            "#favorites"

        Route id ->
            "#routes/" ++ (toString id)

        Search query ->
            "#search/" ++ query


hashParser : Navigation.Location -> Result String Page
hashParser location =
    UrlParser.parse identity pageParser (String.dropLeft 1 location.hash)


type Page
    = Home
    | About
    | Favorites
    | Route Int
    | Search String


pageParser : UrlParser.Parser (Page -> a) a
pageParser =
    UrlParser.oneOf
        [ UrlParser.format Home (UrlParser.s "")
        , UrlParser.format Home (UrlParser.s "home")
        , UrlParser.format About (UrlParser.s "about")
        , UrlParser.format Favorites (UrlParser.s "favorites")
        , UrlParser.format Route (UrlParser.s "routes" </> UrlParser.int)
        , UrlParser.format Search (UrlParser.s "search" </> UrlParser.string)
        ]


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

        -- ! if Dict.member query model.cache then [] else [ get query ]
        Ok page ->
            { model | page = page, search = "" }
                ! []


type alias RuterStopp =
    { id : Int
    , name : String
    , district : String
    }


type Msg
    = UpdateSearchText String
    | DoSearch
    | SearchSuccess (List RuterStopp)
    | SearchFailed Http.Error


type alias Model =
    { page : Page
    , search : String
    , results : List RuterStopp
    , error : String
    }


init : Result String Page -> ( Model, Cmd Msg )
init result =
    urlUpdate result (Model Home "" [] "")


logError a =
    Debug.log (toString a)


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        UpdateSearchText text ->
            ( { model | search = text }, Cmd.none )

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
        ("Name" := Json.oneOf [ Json.string, Json.null "" ])
        ("District" := Json.oneOf [ Json.string, Json.null "" ])


decodeRuteSearch : Json.Decoder (List RuterStopp)
decodeRuteSearch =
    Json.list ruterStoppDecoder


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


headerBar : Model -> Html b
headerBar model =
    header []
        [ h1 [] [ text "Rask Rute" ]
        , navBar model
        ]


navBar model =
    nav
        []
        [ ul []
            [ navigationItem "#home" "SØK"
            , navigationItem "#favorites" "FAVORITTER"
            , navigationItem "#about" "OM"
            ]
        ]


navigationItem href' title =
    li [ class "nav-item" ] [ a [ href href' ] [ text title ] ]


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


ruteHref : RuterStopp -> String
ruteHref stopp =
    "#routes/" ++ (toString stopp.id)


result : RuterStopp -> Html Msg
result stopp =
    tr []
        [ td [] [ a [ href (ruteHref stopp) ] [ text stopp.name ] ]
        , td [] [ text stopp.district ]
        ]


searchResults : Model -> Html Msg
searchResults model =
    if (List.length model.results) > 0 then
        div []
            [ h4 [] [ text "Ser du etter?" ]
            , table [ class "searchResults" ]
                (List.map result model.results)
            ]
    else
        div [] []


app : Model -> Html Msg
app model =
    div [] (viewPage model)


viewPage : Model -> List (Html Msg)
viewPage model =
    case model.page of
        Home ->
            [ searchForm model
            , searchResults model
            ]

        About ->
            [ searchForm model
            , searchResults model
            ]

        Favorites ->
            [ searchForm model
            , searchResults model
            ]

        Route id ->
            [ searchForm model
            , searchResults model
            ]

        Search term ->
            [ searchForm model
            , searchResults model
            ]


foot : Model -> Html Msg
foot _ =
    footer []
        [ text "Footer"
        ]


view : Model -> Html Msg
view model =
    div [ id "main" ]
        [ headerBar model
        , app model
        , foot model
        ]


stopView : Model -> Html Msg
stopView model =
    div [] [ text "View stop" ]
