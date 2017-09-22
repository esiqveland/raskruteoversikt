module Components.Favorites exposing (viewFavorites)

import Dict
import Components.Card exposing (card)
import Types exposing (Favorite)
import State exposing (Model)
import String
import Html exposing (Html, i, div, ul, li, text, a)
import Html.Attributes exposing (class, href)


viewFavorites : Model -> Html msg
viewFavorites model =
    div [] [ listFavorites model ]


listFavorites : Model -> Html msg
listFavorites model =
    let
        favs =
            Dict.values model.favorites
    in
        div []
            (List.map (\val -> renderFav val) favs)


renderFav : Favorite -> Html msg
renderFav fav =
    card (div [] [ a [ href (ruteHref fav) ] [ text fav.name ] ])

ruteHref : Favorite -> String
ruteHref fav =
    "#routes/" ++ (toString fav.id)

