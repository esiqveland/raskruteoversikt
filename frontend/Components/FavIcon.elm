module Components.FavIcon exposing (favIcon)

import Types exposing (..)
import Html
import Html exposing (Html, header, a, i, form, table, tr, td, button, div, text, nav, span, footer, input, ul, li, h1, h3, h4, section)
import Html.Attributes exposing (style, class, id, value, placeholder, href)


favIcon : List Favorite -> RuterStopp -> Html msg
favIcon favorites ruterStopp =
    if isFavorite favorites ruterStopp then
        i [ class "gilded fa fa-star" ] []
    else
        i [ class "gilded fa fa-star-o" ] []
