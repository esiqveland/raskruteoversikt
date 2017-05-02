module View exposing (init)

import Dict
import Html exposing (h2, label)
import Html exposing (Html, header, a, form, table, tr, td, button, div, text, nav, span, footer, input, ul, li, h1, h3, h4, section, p)
import Html.Attributes exposing (class, disabled, for, href, id, placeholder, style, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
import Types exposing (..)
import State exposing (Model)
import Components.Spinner exposing (spinner)


init : Model -> Html Msg
init model =
    div [ id "main", style [ ("minWidth", "320px") ] ]
        [ headerBar model
        , app model
        , foot model
        ]


app : Model -> Html Msg
app model =
    section [ class "main-content" ] (viewPage model)


viewPage : Model -> List (Html Msg)
viewPage model =
    case model.page of
        Home ->
            [ p [ style [ ("margin-bottom", "3rem"), ("margin-top", "2rem") ] ] [ text "Rask Rute lar deg slå opp direkte på ditt stopp og viser deg avgangene der i sanntid." ]
            , searchForm model
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
            case Dict.get id model.stops of
                Nothing ->
                    case model.isLoading of
                    True ->
                        [ spinner ]

                    False ->
                        [ text "Fant ikke noe på denne ruten." ]

                Just aStop ->
                    [ viewRuterStop aStop ]

        Search term ->
            [ searchForm model
            , searchResults model
            ]


viewRuterStop : RuterStopp -> Html msg
viewRuterStop ruterStopp =
    div []
        [ h3 [] [ text ruterStopp.name ]
        , viewAvganger ruterStopp
        ]


viewAvganger : RuterStopp -> Html msg
viewAvganger ruterStopp =
    section [] (List.map viewAvgang ruterStopp.avganger)


viewAvgang : RuterAvgang -> Html msg
viewAvgang ruteAvgang =
    div [] [ text (ruteAvgang.monitoredVehicleJourney.publishedLineName ++ " " ++ ruteAvgang.monitoredVehicleJourney.destinationName) ]


headerBar : Model -> Html msg
headerBar model =
    header [ class "header" ]
        [ h2 [] [ text "Rask Rute" ]
        , navBar model
        ]


navBar model =
    nav
        []
        [ navigationItem "#home" "SØK"
        , navigationItem "#favorites" "FAVORITTER"
        , navigationItem "#about" "OM"
        ]


navigationItem : String -> String -> Html msg
navigationItem aHref title =
    span
        [ class "navbar-item" ]
        [ a [ class "navbar-link", href aHref ] [ text title ] ]


searchForm : Model -> Html Msg
searchForm model =
    form
        [ onSubmit DoSearch, class "form sok" ]
        [
            div
                [ class "form-item u-full-width" ]
                [ label [ for "sokefelt" ] [ text "Søk etter stoppested" ]
                , input
                    [ id "sokefelt"
                    , type_ "text"
                    , placeholder "Jernbanetorget"
                    , onInput UpdateSearchText
                    , value model.search
                    , class "u-full-width"
                    ] []
                   , button [ disabled model.isLoading, type_ "submit", class "button-primary" ] [ text "Search" ]
                ]
        ]


ruteHref : SearchStopp -> String
ruteHref stopp =
    "#routes/" ++ (toString stopp.id)


result : SearchStopp -> Html msg
result stopp =
    tr []
        [ td [] [ a [ href (ruteHref stopp) ] [ text stopp.name ] ]
        , td [] [ text stopp.district ]
        ]


searchResultList : Model -> Html msg
searchResultList model =
    if (List.length model.results) > 0 then
        div []
            [ h4 [] [ text "Ser du etter?" ]
            , table [ class "searchResults" ]
                (List.map result model.results)
            ]
    else
        div [] []



searchResults : Model -> Html msg
searchResults model =
    if model.isLoading then
        div [] [ spinner ]
    else 
        div [] [ searchResultList model ]

stopView : Model -> Html msg
stopView model =
    div [] [ text "View stop" ]


foot : Model -> Html msg
foot _ =
    footer []
        [ text "Footer"
        ]
