enum Box {
    //% block="green"
    //% block.loc.nl="groen"
    Green = 1,
    //% block="blue"
    //% block.loc.nl="blauw"
    Blue = 2,
    //% block="yellow"
    //% block.loc.nl="geel"
    Yellow = 3
}
enum Side {
    //% block="A"
    A = 1,
    //% block="B"
    B = 2
}

let PALLETBOX = Box.Green
let PALLETSIDE = Side.A

CForklift.init()

let BOX: Box
let SIDE: Side

let RouteGreenBringA: handler
let RouteGreenReturnA: handler
let RouteBlueBringA: handler
let RouteBlueReturnA: handler
let RouteYellowBringA: handler
let RouteYellowReturnA: handler
let RouteGreenBringB: handler
let RouteGreenReturnB: handler
let RouteBlueBringB: handler
let RouteBlueReturnB: handler
let RouteYellowBringB: handler
let RouteYellowReturnB: handler
let RouteHomeToStart: handler
let RouteStartToHome: handler
let StartNextJob: handler

function handle(dest: number) {
    PALLETBOX = (dest && 0x0F) << 4
    PALLETSIDE = (dest && 0xF0)
}

namespace CForklift {

    export enum Lift {
        //% block="up"
        //% block.loc.nl="omhoog"
        Up,
        //% block="down"
        //% block.loc.nl="omlaag"
        Down
    }

    export function init() {
        ColorSensor.init()
        CMecanum.init()

        Nezha.setServoType(Servo.S1, ServoType.ST360)
        Nezha.setServoType(Servo.S2, ServoType.ST360)

        basic.showLeds(`
            . . . . .
            . . . . .
            . . # . .
            . . . . .
            . . . . .
            `)
        basic.pause(500)
        basic.showIcon(IconNames.SmallSquare)
        basic.pause(500)
        basic.showIcon(IconNames.Square)
        basic.pause(500)
        basic.clearScreen()

        CForklift.liftUp()
        basic.pause(500)
        CForklift.liftDown()

        basic.showIcon(IconNames.Yes)
    }

    //% block="stop"
    //% block.loc.nl="stop"
    export function stop() {
        Nezha.setFourWheelSpeed(0, 0, 0, 0)
    }

    //% block="stop in the %box box"
    //% block.loc.nl="stop in vak %box"
    export function waitBox(box: Box) {
        let col: Color
        switch (box) {
            case Box.Green: col = Color.Green; break;
            case Box.Blue: col = Color.Blue; break;
            case Box.Yellow: col = Color.Yellow; break;
        }
        while (ColorSensor.read() != col) { basic.pause(1) }
        stop()
    }

    //% block="stop at a crossing"
    //% block.loc.nl="stop op een kruispunt"
    export function waitCrossing() {
        while (ColorSensor.read() != Color.Orange) { basic.pause(1) }
        stop()
    }

    //% block="move %dir"
    //% block.loc.nl="rijd naar %dir"
    export function move(dir: Move) {
        CMecanum.move(dir)
    }

    //% block="make a %turn"
    //% block.loc.nl="maak een %turn"
    export function turn(dir: Turn) {
        CMecanum.turn(dir)
    }

    //% color="#FFCC00"
    //% block="when a new pallet is taken in"
    //% block.loc.nl="wanneer een nieuwe pallet binnenkomt"
    export function onStartNextJob(programmableCode: () => void): void {
        StartNextJob = programmableCode;
    }

    //% subcategory="Bestemming"
    //% block="delivery side"
    //% block.loc.nl="aflever-zijde"
    export function palletSide(): Side {
        return SIDE
    }

    //% subcategory="Bestemming"
    //% block="delivery box"
    //% block.loc.nl="aflever-vak"
    export function palletBox(): Box {
        return BOX
    }

    //% subcategory="Bestemming"
    //% block="side %side"
    //% block.loc.nl="zijde %side"
    export function asSide(side: Side): Side {
        return side
    }

    //% subcategory="Bestemming"
    //% block="box %box"
    //% block.loc.nl="vak %box"
    export function asColor(box: Box): Box {
        return box
    }

    //% subcategory="Bestemming"
    //% block="follow the route returning from box %box side %side"
    //% block.loc.nl="volg de route terug van vak %box zijde %side"
    export function returnFrom(box: number, side: number) {
        switch (box) {
            case Box.Green:
                if ((side == Side.A) && RouteGreenReturnA) RouteGreenReturnA()
                if ((side == Side.B) && RouteGreenReturnB) RouteGreenReturnB()
                break;
            case Box.Blue:
                if ((side == Side.A) && RouteBlueReturnA) RouteBlueReturnA()
                if ((side == Side.B) && RouteBlueReturnB) RouteBlueReturnB()
                break;
            case Box.Yellow:
                if ((side == Side.A) && RouteYellowReturnA) RouteYellowReturnA()
                if ((side == Side.B) && RouteYellowReturnB) RouteYellowReturnB()
                break;
        }
    }

    //% subcategory="Bestemming"
    //% block="follow the route to box %box side %side"
    //% block.loc.nl="volg de route naar vak %box zijde %side"
    export function bringTo(box: number, side: number) {
        switch (box) {
            case Box.Green:
                if ((side == Side.A) && RouteGreenBringA) RouteGreenBringA()
                if ((side == Side.B) && RouteGreenBringB) RouteGreenBringB()
                break;
            case Box.Blue:
                if ((side == Side.A) && RouteBlueBringA) RouteBlueBringA()
                if ((side == Side.B) && RouteBlueBringB) RouteBlueBringB()
                break;
            case Box.Yellow:
                if ((side == Side.A) && RouteYellowBringA) RouteYellowBringA()
                if ((side == Side.B) && RouteYellowBringB) RouteYellowBringB()
                break;
        }
    }


    //% subcategory="Bestemming"
    //% block="follow the route from start to home"
    //% block.loc.nl="volg de route van start naar de thuisbasis"
    export function startToHome() {
        if (RouteStartToHome) RouteStartToHome()
    }

    //% subcategory="Bestemming"
    //% block="follow the route from home to start"
    //% block.loc.nl="volg de route van de thuisbasis naar start"
    export function homeToStart() {
        if (RouteHomeToStart) RouteHomeToStart()
    }

    //% subcategory="Liftbediening"
    //% block="has load"
    //% block.loc.nl="heeft lading"
    export function isLoaded(): boolean {
        SwitchSensor.setPort(RJPort.J1)
        return (SwitchSensor.read() == Switch.Pressed)
    }

    //% subcategory="Liftbediening"
    //% block="move the lift down"
    //% block.loc.nl="beweeg de lift omlaag"
    export function liftDown() {
        for (let i = 315; i >= 0; i--) {
            Nezha.servoAngle(Servo.S1, 360 - i)
            basic.pause(2)
        }
        Nezha.servoAngle(Servo.S2, 350)
        basic.pause(150)
        Nezha.servoAngle(Servo.S2, 360)
    }

    //% subcategory="Liftbediening"
    //% block="move the lift up"
    //% block.loc.nl="beweeg de lift omhoog"
    export function liftUp() {
        Nezha.servoAngle(Servo.S2, 350)
        basic.pause(150)
        Nezha.servoAngle(Servo.S2, 340)
        for (let j = 0; j <= 315; j++) {
            Nezha.servoAngle(Servo.S1, 360 - j)
            basic.pause(2)
        }
    }

    //% subcategory="Routes"
    //% color="#FFCC00"
    //% block="the route returning from box %box side %side"
    //% block.loc.nl="de route terug van vak %box zijde %side"
    export function goRouteReturn(box: Box, side: Side, programmableCode: () => void): void {
        switch (box) {
            case Box.Green:
                if (side == Side.A) RouteGreenReturnA = programmableCode;
                if (side == Side.B) RouteGreenReturnB = programmableCode;
                break;
            case Box.Blue:
                if (side == Side.A) RouteBlueReturnA = programmableCode;
                if (side == Side.B) RouteBlueReturnB = programmableCode;
                break;
            case Box.Yellow:
                if (side == Side.A) RouteYellowReturnA = programmableCode;
                if (side == Side.B) RouteYellowReturnB = programmableCode;
                break;
        }
    }

    //% subcategory="Routes"
    //% color="#FFCC00"
    //% block="the route to box %box side %side"
    //% block.loc.nl="de route naar vak %box zijde %side"
    export function goRouteBring(box: Box, side: Side, programmableCode: () => void): void {
        switch (box) {
            case Box.Green:
                if (side == Side.A) RouteGreenBringA = programmableCode;
                if (side == Side.B) RouteGreenBringB = programmableCode;
                break;
            case Box.Blue:
                if (side == Side.A) RouteBlueBringA = programmableCode;
                if (side == Side.B) RouteBlueBringB = programmableCode;
                break;
            case Box.Yellow:
                if (side == Side.A) RouteYellowBringA = programmableCode;
                if (side == Side.B) RouteYellowBringB = programmableCode;
                break;
        }
    }

    //% subcategory="Routes"
    //% color="#FFCC00"
    //% block="the route from home to start"
    //% block.loc.nl="de route van de thuisbasis naar start"
    export function goRouteHomeToStart(programmableCode: () => void): void {
        RouteHomeToStart = programmableCode;
    }

    //% subcategory="Routes"
    //% color="#FFCC00"
    //% block="the route from start to home"
    //% block.loc.nl="de route van start naar de thuisbasis"
    export function goStartToHome(programmableCode: () => void): void {
        RouteStartToHome = programmableCode;
    }
}
basic.forever(function () {
    let ROUTEBUSY = 0
    if (ROUTEBUSY) {
        return
    }
    if (!(PALLETBOX) || !(PALLETSIDE)) {
        return
    }
    if (StartNextJob) {
        BOX = PALLETBOX
        SIDE = PALLETSIDE
        StartNextJob()
    }
})
