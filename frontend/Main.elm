module Main exposing (..)

import Geolocation
import Navigation
import State
import View
import Pages exposing (..)
import Types exposing (..)
import Favorites exposing (..)



main : Program String State.Model Msg
main =
    Navigation.programWithFlags UrlChange
        { init = State.init
        , view = View.init
        , update = State.updateLogger
        , subscriptions = State.subscriptions
        }
