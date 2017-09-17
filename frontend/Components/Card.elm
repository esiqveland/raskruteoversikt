module Components.Card exposing (card)

import Html
import Html exposing (Html, header, a, form, table, tr, td, button, div, text, nav, span, footer, input, ul, li, h1, h3, h4, section)
import Html.Attributes exposing (style, class, id, value, placeholder, href)

card : Html msg -> Html msg
card wrapped = 
  div [ class "card" ] 
    [ div [class "card-content"] [ wrapped ]
    ]

