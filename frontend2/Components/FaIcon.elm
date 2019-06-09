module Components.FaIcon exposing (Icon(..), faIcon, faIconWithClass)

import String
import Html exposing (Html, i)
import Html.Attributes exposing (class)


type Icon
    = Star
    | StarOutline
    | LocationArrow


faIconWithClass : Icon -> String -> Html msg
faIconWithClass icon classes =
    i [ class (String.join " " [ "fa", toClassName icon, classes ]) ] []


faIcon : Icon -> Html msg
faIcon icon =
    faIconWithClass icon ""


toClassName : Icon -> String
toClassName icon =
    case icon of
        Star ->
            "star"

        StarOutline ->
            "star-o"

        LocationArrow ->
            "fa-location-arrow"
