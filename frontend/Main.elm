module Main exposing (..)

import Navigation
import Pages exposing (..)
import State
import View
import Types exposing (..)

-- main : (Navigation.Location -> msg) -> Program Never model msg
main =
    Navigation.program UrlChange
        { init = State.init
        , view = View.init
        , update = State.updateLogger 
        , subscriptions = State.subscriptions
        }
