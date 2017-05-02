module Components.Spinner exposing (spinner)

import Html
import Html exposing (Html, header, a, form, table, tr, td, button, div, text, nav, span, footer, input, ul, li, h1, h3, h4, section)
import Html.Attributes exposing (style, class, id, value, placeholder, href)

spinner : Html msg
spinner =
    div [ class "sk-fading-circle" ]
        [ div [ class "sk-circle1 sk-circle" ] []
        , div [ class "sk-circle2 sk-circle" ] []
        , div [ class "sk-circle3 sk-circle" ] []
        , div [ class "sk-circle4 sk-circle" ] []
        , div [ class "sk-circle5 sk-circle" ] []
        , div [ class "sk-circle6 sk-circle" ] []
        , div [ class "sk-circle7 sk-circle" ] []
        , div [ class "sk-circle8 sk-circle" ] []
        , div [ class "sk-circle9 sk-circle" ] []
        , div [ class "sk-circle10 sk-circle" ] []
        , div [ class "sk-circle11 sk-circle" ] []
        , div [ class "sk-circle12 sk-circle" ] []
        ]

