module View exposing (init)

import Dict
import Html
import Html exposing (Html, header, a, form, table, tr, td, button, div, text, nav, span, footer, input, ul, li, h1, h3, h4, section)
import Html.Attributes exposing (style, class, id, value, type', placeholder, href)
import Html.Events exposing (onClick, onInput, onSubmit)
import Types exposing (..)


init : Model -> Html Msg
init model =
    div [ id "main" ]
        [ headerBar model
        , app model
        , foot model
        ]


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
            case Dict.get id model.stops of
                Nothing ->
                    [ text "Fant ikke noe" ]

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


navItemStyle : Html.Attribute msg
navItemStyle =
  style
    [ ("width", "33%")
    , ("listStyleType", "none")
    , ("display", "inline-block")
    ]

navigationItem : String -> String -> Html msg
navigationItem href' title =
    li [ navItemStyle ] [ a [ href href' ] [ text title ] ]


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


ruteHref : SearchStopp -> String
ruteHref stopp =
    "#routes/" ++ (toString stopp.id)


result : SearchStopp -> Html msg
result stopp =
    tr []
        [ td [] [ a [ href (ruteHref stopp) ] [ text stopp.name ] ]
        , td [] [ text stopp.district ]
        ]


searchResults : Model -> Html msg
searchResults model =
    if (List.length model.results) > 0 then
        div []
            [ h4 [] [ text "Ser du etter?" ]
            , table [ class "searchResults" ]
                (List.map result model.results)
            ]
    else
        div [] []


stopView : Model -> Html msg
stopView model =
    div [] [ text "View stop" ]


foot : Model -> Html msg
foot _ =
    footer []
        [ text "Footer"
        ]
