import React from 'react'
import { Bus, Signal } from 'bulb'
import { range, set } from 'fkit'
import { render } from 'react-dom'

import Game from './Game'
import Player from './Player'
import RootView from './views/RootView'
import build from './world_builder'
import log from './log'
import nextMove from './ai'
import { play } from './sound'

/**
 * The number of milliseconds between clock ticks.
 */
const CLOCK_INTERVAL = 250

/**
 * The number of players in the game.
 */
const PLAYERS = 5

/**
 * The dimensions.
 */
const WIDTH = 600
const HEIGHT = 600

const root = document.getElementById('root')

// Create the players. The first player is a human player, the rest are AI
// players.
const players = range(0, PLAYERS).map(id => new Player(id, id === 0))

// Create the initial state.
const initialState = {
  game: buildGame(players),
  muted: window.localStorage.getItem('muted') === 'true'
}

// Create the bus signal.
const bus = new Bus()

// Create the clock signal.
const clockSignal = Signal.periodic(CLOCK_INTERVAL)

// The state signal scans the reducer function over events on the input signal.
const stateSignal = bus.scan(reducer, initialState).dedupe()

// The player AI stream emits the moves calculated for the current player.
const aiSignal = stateSignal
  .sample(clockSignal)
  .filter(state => !(state.game.over || state.game.currentPlayer.human))
  .concatMap(state => nextMove(state.game.currentPlayer, state.game.world))

const subscriptions = [
  // Forward events from the AI signal to the bus.
  bus.connect(aiSignal),

  // Render the UI whenever the state changes.
  stateSignal.subscribe(state => render(<RootView bus={bus} state={state} />, root))
]

if (module.hot) {
  module.hot.dispose(() => {
    log.info('Unsubscribing...')
    subscriptions.forEach(s => s.unsubscribe())
  })
}

/**
 * Builds a new game.
 *
 * @param players The players of the game.
 * @returns A new game.
 */
function buildGame (players) {
  const world = build(WIDTH, HEIGHT)
  return new Game(players, world)
}

/**
 * Applies an event to yield a new state.
 *
 * @param state The current state.
 * @param event An event.
 * @returns A new state.
 */
function reducer (state, event) {
  let { game, muted } = state

  if (event === 'pause') {
    game = set('paused', !game.paused, game)
  } else if (event === 'mute') {
    muted = !muted
    window.localStorage.setItem('muted', muted)
  } else if (event === 'restart') {
    game = buildGame(game.players)
  } else if (event === 'end-turn') {
    game = game.endTurn()
  } else if (event.type === 'select-country') {
    const result = game.selectCountry(event.country)
    game = result.game
    if (!muted) { play(result.action) }
  }

  if (!muted && game.win) {
    play('win')
  } else if (!muted && game.over) {
    play('lose')
  }

  return { ...state, game, muted }
}
