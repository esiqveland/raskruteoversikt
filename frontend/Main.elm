module Main exposing (..)

import Navigation
import Pages exposing (..)
import State
import View


main : Program Never
main =
    Navigation.program (Navigation.makeParser hashParser)
        { init = State.init
        , view = View.init
        , update = State.update
        , urlUpdate = State.urlUpdate
        , subscriptions = State.subscriptions
        }
