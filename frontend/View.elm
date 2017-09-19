module View exposing (init)

import Dict
import Html exposing (h2, label)
import Html exposing (Html, header, a, form, table, tr, td, button, div, text, nav, span, footer, input, ul, li, h1, h3, h4, h5, article, section, p)
import Html.Attributes exposing (class, disabled, for, href, id, placeholder, style, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
import Types exposing (..)
import State exposing (Model)
import Components.Spinner exposing (spinner)
import Components.Card exposing (card)
import Components.FavIcon exposing (favIcon)


init : Model -> Html Msg
init model =
    div [ id "main", style [ ( "maxWidth", "780px" ), ( "display", "flex" ), ( "flexDirection", "column" ), ( "width", "100%" ) ] ]
        [ headerBar model
        , app model
        , foot model
        ]


app : Model -> Html Msg
app model =
    section [ class "main-content" ]
        [ div [ class "row" ] [ div [ class "twelve columns" ] (viewPage model) ]
        ]


aboutPage : model -> List (Html Msg)
aboutPage model =
    [ h5 [] [ text "Begrensninger" ]
    , article []
        [ section [] [ text "Foreløpig kan man kun slå opp på enkeltstopp." ]
        , section [] [ text "Vi er også begrenset til kun å vise avganger som har sanntidsdata." ]
        ]
    , h5 [] [ text "Kontakt" ]
    , article []
        [ text "Har du spørsmål eller forslag, ta kontakt på "
        , a [ class "none", href "https://github.com/esiqveland/raskruteoversikt/issues" ] [ text "GitHub" ]
        , text "."
        ]
    ]


homeGreeting : Html Msg
homeGreeting =
    p
        [ style [ ( "margin-bottom", "3rem" ), ( "margin-top", "2rem" ) ]
        ]
        [ text "Rask Rute lar deg slå opp direkte på ditt stopp og viser deg avgangene der i sanntid." ]


viewPage : Model -> List (Html Msg)
viewPage model =
    case model.page of
        Home ->
            [ homeGreeting
            , searchForm model
            , searchResults model
            ]

        About ->
            aboutPage model

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
                    [ viewRuterStop model aStop ]

        Search term ->
            [ homeGreeting
            , searchForm model
            , searchResults model
            ]


viewRuterStop : Model -> RuterStopp -> Html Msg
viewRuterStop model ruterStopp =
    div []
        [ h5 [ class "hover-hand", onClick (ToggleFavorite ruterStopp) ]
            [ favIcon (Dict.get ruterStopp.id model.favorites)
            , text (" " ++ ruterStopp.name)
            ]
        , viewAvganger ruterStopp
        ]


viewAvganger : RuterStopp -> Html msg
viewAvganger ruterStopp =
    section [] (List.map viewAvgang ruterStopp.avganger)


viewAvgang : RuterAvgang -> Html msg
viewAvgang ruteAvgang =
    card (renderAvgang ruteAvgang)


renderAvgang : RuterAvgang -> Html msg
renderAvgang ruteAvgang =
    div [ class "" ]
        [ text (ruteAvgang.monitoredVehicleJourney.publishedLineName ++ " " ++ ruteAvgang.monitoredVehicleJourney.destinationName) ]


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
        [ div
            [ class "form-item u-full-width" ]
            [ label [ for "sokefelt" ] [ text "Søk etter stoppested" ]
            , input
                [ id "sokefelt"
                , type_ "text"
                , placeholder "Jernbanetorget"
                , onInput UpdateSearchText
                , value model.search
                , class "u-full-width"
                ]
                []
            , div [ class "form-item sok-item" ]
                [ button
                    [ disabled model.isLoading
                    , type_ "submit"
                    , class "button-primary u-full-width"
                    ]
                    [ text "Finn stopp!" ]
                ]
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


renderSearchResults : Model -> List SearchStopp -> Html msg
renderSearchResults model hits =
    case List.head hits of
        Nothing ->
            h5 [] [ text ("Fant ikke noen stopp for dette stedet :-(") ]

        Just _ ->
            table [ class "u-full-width searchResults" ]
                (List.map result hits)


searchResultView : Model -> Html msg
searchResultView model =
    case model.results of
        Just hits ->
            div []
                [ h4 [] [ text "Ser du etter..." ]
                , renderSearchResults model hits
                ]

        Nothing ->
            div [] [ h4 [] [ text "" ] ]


searchResults : Model -> Html msg
searchResults model =
    div [ class "row" ]
        [ div [ class "twelve columns" ]
            [ if model.isLoading then
                div [] [ spinner ]
              else
                div [ class "u-full-width" ] [ searchResultView model ]
            ]
        ]


stopView : Model -> Html msg
stopView model =
    div [] [ text "View stop" ]


foot : Model -> Html msg
foot _ =
    footer []
        [ text "Footer"
        ]
