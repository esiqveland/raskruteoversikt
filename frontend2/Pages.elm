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


hashParser : Navigation.Location -> Result String Page
hashParser location =
    UrlParser.parse identity pageParser (String.dropLeft 1 location.hash)


pageParser : UrlParser.Parser (Page -> a) a
pageParser =
    UrlParser.oneOf
        [ UrlParser.format Home (UrlParser.s "")
        , UrlParser.format Home (UrlParser.s "home")
        , UrlParser.format About (UrlParser.s "about")
        , UrlParser.format Favorites (UrlParser.s "favorites")
        , UrlParser.format Route (UrlParser.s "routes" </> UrlParser.int)
        , UrlParser.format Search (UrlParser.s "search" </> UrlParser.string)
        ]
