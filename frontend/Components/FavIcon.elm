module Components.FavIcon exposing (favIcon)

import Types exposing (..)
import Html
import Html exposing (Html, header, a, i, form, table, tr, td, button, div, text, nav, span, footer, input, ul, li, h1, h3, h4, section)
import Html.Attributes exposing (style, class, id, value, placeholder, href)


favIcon : Maybe Favorite -> Html msg
favIcon maybefav =
    case maybefav of
        Just fav ->
            i [ class "gilded fa fa-star" ] []

        Nothing ->
            i [ class "gilded fa fa-star-o" ] []
