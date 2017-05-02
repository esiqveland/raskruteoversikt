module Pages exposing (..)

import String
import Navigation
import UrlParser exposing ((</>))
import Types exposing (..)


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


hashParser : Navigation.Location -> Maybe Page
hashParser location =
    UrlParser.parseHash pageParser location


pageParser : UrlParser.Parser (Page -> a) a
pageParser =
    UrlParser.oneOf
        [ UrlParser.map Home (UrlParser.s "")
        , UrlParser.map Home (UrlParser.s "home")
        , UrlParser.map About (UrlParser.s "about")
        , UrlParser.map Favorites (UrlParser.s "favorites")
        , UrlParser.map Route (UrlParser.s "routes" </> UrlParser.int)
        , UrlParser.map Search (UrlParser.s "search" </> UrlParser.string)
        ]
