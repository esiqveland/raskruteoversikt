module Main exposing (..)

import Navigation
import Pages exposing (..)
import State
import View
import Types exposing (..)


--main : Program never model msg
main =
    Navigation.programWithFlags UrlChange
        { init = State.init
        , view = View.init
        , update = State.updateLogger 
        , subscriptions = State.subscriptions
        }
