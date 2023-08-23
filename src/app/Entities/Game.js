import Characters from "./Character.js"
import { Player } from "./Player.js"

/**
 * @readonly
 * @enum {string}
*/
export const GameStates = {
    WAITING_PLAYERS: 'waiting_for_players',
    WAITING_HOST: 'waiting_for_host',
    STARTED: 'started',
    FINISHED: 'finished',
    PAUSED: 'paused'
}

class Game {
    /** @type {string} */ _hostSocketId
    /** @type {Player[]} */ _players
    /** @type {GameStates} */ _currentState
    /** @type {string} */ _currentKillerSocketID

    constructor() {
        this._hostSocketId = ""
        this._currentKillerSocketID = ""
        this._players = []
        this._currentState = GameStates.WAITING_PLAYERS
    }

    get game() {
        return {
            host: this._hostSocketId,
            players: this._players,
            state: this._currentState,
            killer: this._currentKillerSocketID,
        }
    }

    get players() {
        return this._players
    }
    
    get hostSocketId() {
        return this._hostSocketId
    }

    get killer() {
        return this._players.find(player => player.socketID === this._currentKillerSocketID)
    }

    get killerSocketID() {
        return this._currentKillerSocketID
    }

    set killerSocketID(socketID) {
        this._currentKillerSocketID = socketID
    }

    /**
     * @param {string} socketId
     */
    set hostSocketId(socketId) {
        this._hostSocketId = socketId
    }

    /**
     * @param {GameStates} state 
     */
    updateState(state) {
        this._currentState = state
    }

    get currentState() {
        return this._currentState
    }

    async close() {
        await new Promise(async (resolve, reject) => {
            try {
                await Characters.reset
                this._players = []
                this._hostSocketId = ""
                this._currentState = GameStates.WAITING_PLAYERS
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    }

    async start() {
        await new Promise((resolve, _) => {
            this._currentState = GameStates.STARTED
            resolve('Game started')
        })
    }

    allPlayersHasCharacter() {
        return this._players.every(player => player.character != null)
    }

    allPlayersWasKiller() {
        return this._players.every(player => player._wasTheKiller)
    }

    get size() {
        return this._players.length
    }

    findPlayerByName(name) {
        return this._players.find(player => player.name === name)
    }

    findPlayerBySocket(socketID) {
        return this._players.find(player => player.socketID === socketID)
    }

    async addPlayer(name, socketID, options = {}) {
        if (this.findPlayerByName(name) || this.findPlayerBySocket(socketID)) {
            return "player already exists"
        }
        const addPromise = new Promise((resolve, _) => {
            this._players.push(new Player(name, socketID, options))
            resolve("success")
        })

        return addPromise.then((data) => data).catch((error) => error)
    }

    /**
     * @param {Player} playerToDisconnect
     */
    disconectPlayer(playerToDisconnect) {
        if (!playerToDisconnect) {
            return false
        }

        this._players = this._players.filter(player => player.socketID !== playerToDisconnect.socketID)
        return true
    }
}

export default new Game()
